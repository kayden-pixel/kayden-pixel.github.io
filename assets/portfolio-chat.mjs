import { answerQuestion, MAX_QUESTION_LENGTH } from './public-answers.mjs';

/* Kingez Public Knowledge Assistant — no model calls, personal data storage or Jarvis tool access. */
(() => {
  "use strict";
  const button = document.querySelector("#know-trigger");
  const panel = document.querySelector("#know-panel");
  const close = document.querySelector("#know-close");
  const transcript = document.querySelector("#know-messages");
  const form = document.querySelector("#know-form");
  const input = document.querySelector("#know-input");
  const status = document.querySelector("#know-status");
  const starters = Array.from(document.querySelectorAll(".know-starter"));
  if (!button || !panel || !transcript || !form || !input) return;

  let knowledge = null;
  let loading = null;
  let lastFocused = null;
  let userMessages = 0;
  const MAX_TURNS = 12;
  const remember = [];
  const links = new Set([
    "https://kayden-pixel.github.io/",
    "https://github.com/kayden-pixel",
    "https://discord.gg/SdCvw52vzS",
    "https://youtube.com/@kingez341yt",
    "https://modrinth.com/plugin/omnipanel",
    "https://modrinth.com/resourcepack/kingez341yt",
    "https://github.com/kayden-pixel/SENSE",
    "https://github.com/kayden-pixel/Kydora-Home-Downloads/releases/latest"
  ]);

  function setStatus(message) {
    if (status) status.textContent = message;
  }
  function pushMessage(who, content, response) {
    const row = document.createElement("div");
    row.className = "know-message " + (who === "you" ? "user" : "assistant");
    const by = document.createElement("span");
    by.className = "who";
    by.textContent = who === "you" ? "VISITOR" : "KINGEZ KNOWLEDGE";
    const bubble = document.createElement("div");
    bubble.className = "know-bubble";
    bubble.textContent = content;
    row.append(by, bubble);
    if (response?.matched && links.has(response.link)) {
      const link = document.createElement("a");
      link.href = response.link;
      link.textContent = response.linkLabel || "Read more";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      bubble.appendChild(link);
    }
    transcript.appendChild(row);
    remember.push(row);
    while (remember.length > 20) remember.shift().remove();
    transcript.scrollTop = transcript.scrollHeight;
  }

  async function loadKnowledge() {
    if (knowledge) return knowledge;
    if (loading) return loading;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 6500);
    loading = fetch(new URL("../data/kingez-public.json", import.meta.url), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      credentials: "omit"
    }).then(response => {
      if (!response.ok) throw new Error("Public profile not available");
      return response.json();
    }).then(value => {
      if (!Array.isArray(value?.topics) || value.schema !== 1) throw new Error("Invalid public profile");
      knowledge = value;
      setStatus("PUBLIC KNOWLEDGE READY · NOT LIVE JARVIS");
      return value;
    }).catch(() => {
      setStatus("PUBLIC KNOWLEDGE UNAVAILABLE");
      return null;
    }).finally(() => {
      window.clearTimeout(timer);
      loading = null;
    });
    return loading;
  }

  async function ask(raw) {
    const question = String(raw ?? "").trim();
    if (!question || question.length > MAX_QUESTION_LENGTH) return;
    if (userMessages >= MAX_TURNS) {
      pushMessage("system", "This conversation has reached its 12-question limit. Close and reopen the assistant to start fresh.");
      return;
    }
    userMessages++;
    pushMessage("you", question);
    input.value = "";
    input.disabled = true;
    const submit = form.querySelector('[type="submit"]');
    if (submit) submit.disabled = true;
    try {
      const data = await loadKnowledge();
      const result = data ? answerQuestion(question, data) : {
        answer: "The public profile is temporarily unavailable. You can still browse the projects or contact Kingez through Discord.",
        matched: false
      };
      pushMessage("system", result.answer, result);
    } catch (_) {
      pushMessage("system", "I could not read the public profile. Please try again later.");
    } finally {
      input.disabled = false;
      if (submit) submit.disabled = false;
      if (userMessages >= MAX_TURNS) {
        input.disabled = true;
        if (submit) submit.disabled = true;
      } else input.focus();
    }
  }

  function openPanel() {
    if (!panel.hidden) return;
    lastFocused = document.activeElement;
    userMessages = 0;
    panel.hidden = false;
    transcript.replaceChildren();
    remember.length = 0;
    input.disabled = false;
    const submit = form.querySelector('[type="submit"]');
    if (submit) submit.disabled = false;
    button.setAttribute("aria-expanded", "true");
    pushMessage("system", "Hey! I'm the Kingez public-profile assistant. Ask about his software, Discord bot commissions, yearly Nitro option, or how to get in touch. I don't have access to private Jarvis data or tools.");
    input.focus();
    void loadKnowledge();
  }
  function closePanel() {
    if (panel.hidden) return;
    panel.hidden = true;
    button.setAttribute("aria-expanded", "false");
    if (lastFocused instanceof HTMLElement && lastFocused.isConnected) lastFocused.focus();
    else button.focus();
  }
  button.addEventListener("click", () => panel.hidden ? openPanel() : closePanel());
  close?.addEventListener("click", closePanel);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) { event.preventDefault(); closePanel(); }
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    void ask(input.value);
  });
  starters.forEach(starter => starter.addEventListener("click", () => {
    if (panel.hidden) openPanel();
    void ask(starter.dataset.question || starter.textContent);
  }));
})();
