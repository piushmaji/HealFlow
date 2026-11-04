import express from 'express';
import {
  handleChatMessage,
  getChatSessions,
  getSessionMessages,
  deleteChatSession,
} from '../controllers/chatController.js';
import { chatRateLimiter } from '../middleware/rateLimiter.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/message', chatRateLimiter, handleChatMessage);
router.get('/sessions', getChatSessions);
router.get('/sessions/:id/messages', getSessionMessages);
router.delete('/sessions/:id', deleteChatSession);

export default router;

