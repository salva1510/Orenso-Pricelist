export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Test R2 connection
    if (url.pathname === "/api/test") {
      const result = await env.FILES.list({ limit: 10 });

      return new Response(
        JSON.stringify({
          success: true,
          bucket: "connected",
          files: result.objects.map(obj => ({
            key: obj.key,
            size: obj.size
          }))
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Serve the existing website
    return env.ASSETS.fetch(request);
  }
};
