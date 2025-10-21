import { Router } from "oak";

const staticRouter = new Router();

// Serve static files
staticRouter.get("/(.*)", async (ctx) => {
  const filePath = ctx.params[0] || "login.html";
  
  try {
    let contentType = "text/html";
    
    if (filePath.endsWith(".css")) {
      contentType = "text/css";
    } else if (filePath.endsWith(".js")) {
      contentType = "application/javascript";
    } else if (filePath.endsWith(".json")) {
      contentType = "application/json";
    }

    const file = await Deno.readTextFile(`./public/${filePath}`);
    
    ctx.response.headers.set("Content-Type", contentType);
    ctx.response.body = file;
  } catch {
    // If file not found, serve login.html as default
    try {
      const file = await Deno.readTextFile("./public/login.html");
      ctx.response.headers.set("Content-Type", "text/html");
      ctx.response.body = file;
    } catch {
      ctx.response.status = 404;
      ctx.response.body = "File not found";
    }
  }
});

export { staticRouter };
