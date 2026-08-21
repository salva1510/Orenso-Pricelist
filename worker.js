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

    // List files
    if (url.pathname === "/api/files" && request.method === "GET") {
      const result = await env.FILES.list({ limit: 100 });

      return new Response(
        JSON.stringify({
          success: true,
          files: result.objects.map(obj => ({
            key: obj.key,
            size: obj.size,
            uploaded: obj.uploaded
          }))
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Upload file
    if (url.pathname === "/api/upload" && request.method === "POST") {
      const filename = url.searchParams.get("name");

      if (!filename) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Missing file name"
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }

      await env.FILES.put(filename, request.body);

      return new Response(
        JSON.stringify({
          success: true,
          message: "File uploaded",
          key: filename
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Download / view file
    if (url.pathname === "/api/download" && request.method === "GET") {
      const key = url.searchParams.get("key");

      if (!key) {
        return new Response("Missing file key", { status: 400 });
      }

      const object = await env.FILES.get(key);

      if (!object) {
        return new Response("File not found", { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);

      return new Response(object.body, {
        headers
      });
    }

    // Delete file
    if (url.pathname === "/api/delete" && request.method === "DELETE") {
      const key = url.searchParams.get("key");

      if (!key) {
        return new Response("Missing file key", { status: 400 });
      }

      await env.FILES.delete(key);

      return new Response(
        JSON.stringify({
          success: true,
          message: "File deleted",
          key
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Website
    return env.ASSETS.fetch(request);
  }
};
