import rateLimit from 'express-rate-limit';

export const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please wait a minute before sending another query.',
  },
});

