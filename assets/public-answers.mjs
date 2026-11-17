/* Shared deterministic, public-only answer engine. No model/API keys or private-memory access. */
export const MAX_QUESTION_LENGTH = 240;

const stopWords = new Set([
  "a","an","and","are","at","be","can","could","do","does","for","from","have",
  "he","her","him","his","how","i","in","is","it","me","my","of","on","or",
  "please","tell","the","their","this","to","us","was","what","when","where",
  "which","who","why","will","with","would","you","your","about","just","some",
  "do","make","create"
]);

export function normalize(value) {
  return String(value ?? "").normalize("NFKC").toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

const words = value => normalize(value).split(" ").filter(
  word => word.length > 1 && !stopWords.has(word)
);
const boundaryContains = (sentence, phrase) =>
  sentence === phrase || (" " + sentence + " ").includes(" " + phrase + " ");

export function answerQuestion(rawQuestion, knowledge) {
  const question = typeof rawQuestion === "string" ? rawQuestion.trim() : "";
  const fallback = knowledge?.fallback ||
    "I only answer public questions about Kingez and his work.";
  if (!question) return { answer: "Ask me about Kingez, his projects, Discord bot commissions, or Jarvis.", matched: false, topic: null };
  if (question.length > MAX_QUESTION_LENGTH) return { answer: "Keep your question under 240 characters, please.", matched: false, topic: null };
  if (!knowledge || !Array.isArray(knowledge.topics)) return { answer: "Public profile information is temporarily unavailable.", matched: false, topic: null };

  const text = normalize(question);
  const terms = [...new Set(words(text))];
  let top = null;
  let highest = 0;
  for (const entry of knowledge.topics) {
    if (!entry || !Array.isArray(entry.aliases) || !Array.isArray(entry.keywords)) continue;
    let score = 0;
    const title = normalize(entry.title);
    const id = normalize(entry.id);
    if (boundaryContains(text,id)) score += 9;
    if (boundaryContains(text,title)) score += 10;
    for (const phrase of entry.aliases) {
      const clean = normalize(phrase);
      if (clean && boundaryContains(text,clean)) score += 14 + Math.min(5,clean.length/10);
    }
    const keywords = new Set(entry.keywords.map(normalize));
    for (const token of terms) {
      if (keywords.has(token)) score += token.length > 5 ? 2.7 : 2.2;
      if (words(title).includes(token)) score += 1.9;
    }
    if (score > highest) { highest = score; top = entry; }
  }
  // A vague word is not enough evidence; unknown/off-topic prompts get a bounded refusal.
  if (!top || highest < 2.6) return { answer: fallback, matched: false, topic: null };
  const link = knowledge.links?.[top.link] || null;
  return {
    answer: String(top.answer || fallback),
    matched: true,
    topic: top.id,
    title: top.title,
    link: typeof link === "string" && link.startsWith("https://") ? link : null,
    linkLabel: top.linkLabel || "Read more"
  };
}
