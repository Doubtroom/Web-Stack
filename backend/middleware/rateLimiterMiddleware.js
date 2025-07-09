import rateLimit from "express-rate-limit"

export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // stricter limit for auth routes
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const internalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // higher limit for internal APIs
    message: {
      error: 'Too many requests to internal API, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Custom rate limiters for specific auth endpoints
export const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
      error: 'Too many signup attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: {
      error: 'Too many login attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const sendOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
      error: 'Too many OTP requests, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const verifyOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: {
      error: 'Too many OTP verifications, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const googleLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: {
      error: 'Too many Google login attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const requestResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
      error: 'Too many password reset requests, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const verifyResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: {
      error: 'Too many password reset verifications, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
      error: 'Too many password reset attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});