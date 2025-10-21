import { Context, Next } from "oak";

// Rate limiting store
const rateLimitStore = new Map<string, number[]>();

export function rateLimitMiddleware(maxRequests = 100, windowMs = 60000) {
  return async (ctx: Context, next: Next) => {
    const ip = ctx.request.ip;
    const now = Date.now();
    
    // Get existing requests for this IP
    const requests = rateLimitStore.get(ip) || [];
    
    // Remove requests outside the time window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    // Check if rate limit exceeded
    if (validRequests.length >= maxRequests) {
      ctx.response.status = 429;
      ctx.response.body = { 
        error: "Too many requests",
        retryAfter: Math.ceil(windowMs / 1000)
      };
      return;
    }
    
    // Add current request
    validRequests.push(now);
    rateLimitStore.set(ip, validRequests);
    
    await next();
  };
}

export function inputValidationMiddleware() {
  return async (ctx: Context, next: Next) => {
    // Skip validation for GET requests and static files
    if (ctx.request.method === "GET" || ctx.request.url.pathname.includes('.')) {
      await next();
      return;
    }
    
    try {
      if (ctx.request.hasBody) {
        const body = await ctx.request.body({ type: "json" }).value;
        
        // Validate input sizes
        const jsonString = JSON.stringify(body);
        if (jsonString.length > 10000) { // 10KB limit
          ctx.response.status = 413;
          ctx.response.body = { error: "Request payload too large" };
          return;
        }
        
        // Check for potential SQL injection patterns
        const sqlInjectionPattern = /[';]|--|\bdrop\b|\bdelete\b|\btruncate\b|\binsert\b|\bupdate\b|\balter\b/i;
        
        function checkForSqlInjection(obj: any): boolean {
          if (typeof obj === 'string') {
            return sqlInjectionPattern.test(obj);
          }
          if (typeof obj === 'object' && obj !== null) {
            return Object.values(obj).some(checkForSqlInjection);
          }
          return false;
        }
        
        if (checkForSqlInjection(body)) {
          console.warn(`Potential SQL injection attempt from ${ctx.request.ip}:`, body);
          ctx.response.status = 400;
          ctx.response.body = { error: "Invalid input detected" };
          return;
        }
        
        // Store validated body for use in routes
        ctx.state.validatedBody = body;
      }
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid JSON" };
      return;
    }
    
    await next();
  };
}

export function securityHeadersMiddleware() {
  return async (ctx: Context, next: Next) => {
    // Security headers
    ctx.response.headers.set("X-Content-Type-Options", "nosniff");
    ctx.response.headers.set("X-Frame-Options", "DENY");
    ctx.response.headers.set("X-XSS-Protection", "1; mode=block");
    ctx.response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    ctx.response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    
    // Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
      "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
      "img-src 'self' data:",
      "connect-src 'self' ws: wss:",
      "object-src 'none'",
      "base-uri 'self'"
    ].join("; ");
    
    ctx.response.headers.set("Content-Security-Policy", csp);
    
    await next();
  };
}

export function loggingMiddleware() {
  return async (ctx: Context, next: Next) => {
    const start = Date.now();
    const method = ctx.request.method;
    const url = ctx.request.url.pathname;
    const ip = ctx.request.ip;
    
    await next();
    
    const duration = Date.now() - start;
    const status = ctx.response.status;
    
    // Log request
    console.log(`${new Date().toISOString()} - ${ip} - ${method} ${url} - ${status} - ${duration}ms`);
    
    // Log suspicious activity
    if (status === 401 || status === 403 || status === 429) {
      console.warn(`Security event: ${ip} - ${method} ${url} - ${status}`);
    }
  };
}
