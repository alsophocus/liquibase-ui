import { Router } from "oak";
import { dbManager } from "../services/database.ts";

const authRouter = new Router();

// Production-ready token store with expiration
const activeTokens = new Map<string, {
  userId: number;
  username: string;
  createdAt: number;
  expiresAt: number;
}>();

// Clean expired tokens every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of activeTokens.entries()) {
    if (now > data.expiresAt) {
      activeTokens.delete(token);
    }
  }
}, 60 * 60 * 1000);

function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function hashPassword(password: string): string {
  // Simple hash for demo - in production use bcrypt
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "salt");
  return Array.from(new Uint8Array(crypto.subtle.digestSync("SHA-256", data)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

authRouter.post("/api/auth/login", async (ctx) => {
  try {
    const body = ctx.request.body({ type: "json" });
    const { username, password } = await body.value;

    // Input validation
    if (!username || !password) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Username and password required" };
      return;
    }

    if (username.length > 50 || password.length > 100) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid input length" };
      return;
    }

    console.log("Login attempt:", username);

    const db = dbManager.getActiveConnection();
    if (!db) {
      console.error("No active database connection");
      ctx.response.status = 500;
      ctx.response.body = { error: "Database not available" };
      return;
    }

    // For demo, use plain password comparison
    // In production, compare with hashed password
    const result = await db.query(
      "SELECT id, username, email FROM users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (result.rows.length === 0) {
      console.log("Invalid credentials for:", username);
      ctx.response.status = 401;
      ctx.response.body = { error: "Invalid credentials" };
      return;
    }

    const user = result.rows[0];
    const token = generateSecureToken();
    const now = Date.now();
    const expiresIn = 24 * 60 * 60 * 1000; // 24 hours
    
    // Store token with expiration
    activeTokens.set(token, {
      userId: user.id,
      username: user.username,
      createdAt: now,
      expiresAt: now + expiresIn
    });

    console.log("Login successful for:", username);

    ctx.response.body = {
      success: true,
      token,
      expiresIn,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    };
  } catch (error) {
    console.error("Login error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Login failed" };
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

    // Check if token is expired
    if (Date.now() > tokenData.expiresAt) {
      activeTokens.delete(token);
      ctx.response.status = 401;
      ctx.response.body = { error: "Token expired" };
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

authRouter.post("/api/auth/logout", async (ctx) => {
  const authHeader = ctx.request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    activeTokens.delete(token);
  }
  
  ctx.response.body = { success: true, message: "Logged out successfully" };
});

export { authRouter };
