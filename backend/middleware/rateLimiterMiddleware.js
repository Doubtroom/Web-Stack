import rateLimit from "express-rate-limit"

export const formDataLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, 
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

export const userLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    message: {
      error: 'Too many user api attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const internalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 500, 
    message: {
      error: 'Too many requests to internal API, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Custom rate limiters for specific auth endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});