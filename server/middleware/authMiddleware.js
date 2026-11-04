/**
 * Auth Middleware for Chat Sessions
 * Verifies Supabase Bearer token if present, allows guest exploration gracefully.
 */
import { supabase } from '../config/supabase.js';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null; // Guest user
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!error && user) {
      req.user = user;
    } else {
      req.user = null;
    }
  } catch (err) {
    req.user = null;
  }

  next();
};

