import { Router } from "oak";
import { dbManager } from "../services/database.ts";

const authRouter = new Router();

// Simple token store for demo
const activeTokens = new Map<string, any>();

function generateToken(): string {
  return crypto.randomUUID();
}

authRouter.post("/api/auth/login", async (ctx) => {
  try {
    const body = ctx.request.body({ type: "json" });
    const { username, password } = await body.value;

    console.log("Login attempt:", username);

    const db = dbManager.getActiveConnection();
    if (!db) {
      console.error("No active database connection");
      ctx.response.status = 500;
      ctx.response.body = { error: "Database not available" };
      return;
    }

    const result = await db.query(
      "SELECT id, username, email FROM users WHERE username = ? AND password = ?",
      [username, password]
    );

    console.log("Query result:", result);

    if (result.rows.length === 0) {
      console.log("Invalid credentials for:", username);
      ctx.response.status = 401;
      ctx.response.body = { error: "Invalid credentials" };
      return;
    }

    const user = result.rows[0];
    const token = generateToken();
    
    // Store token
    activeTokens.set(token, {
      userId: user.id,
      username: user.username,
      createdAt: Date.now()
    });

    console.log("Login successful for:", username);

    ctx.response.body = {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    };
  } catch (error) {
    console.error("Login error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Login failed: " + error.message };
  }
});

authRouter.get("/api/auth/verify", async (ctx) => {
  const authHeader = ctx.request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    ctx.response.status = 401;
    ctx.response.body = { error: "No token provided" };
    return;
  }

  try {
    const token = authHeader.substring(7);
    const tokenData = activeTokens.get(token);
    
    if (!tokenData) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Invalid token" };
      return;
    }
    
    ctx.response.body = {
      valid: true,
      user: {
        id: tokenData.userId,
        username: tokenData.username
      }
    };
  } catch {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid token" };
  }
});

export { authRouter };
