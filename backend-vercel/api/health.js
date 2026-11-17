export default {
  fetch(request) {
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
      });
    }
    return new Response(JSON.stringify({
      service: 'kingez-public-knowledge',
      status: 'ready',
      public_only: true,
      jarvis_remote_access: false,
      knowledge_schema: 1
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }
};
