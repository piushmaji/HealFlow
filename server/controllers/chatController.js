/**
 * Chat Controller
 * Handles incoming chat messages, chat history sessions, and deletion.
 */
import { processChatMessage } from '../services/ragService.js';
import { supabase } from '../config/supabase.js';

export const handleChatMessage = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message field is required.' });
    }

    const aiResult = await processChatMessage(message.trim());

    // Optionally save message to chat_messages if session exists
    if (sessionId) {
      try {
        await supabase.from('chat_messages').insert([
          { session_id: sessionId, sender: 'user', content: message.trim() },
          { session_id: sessionId, sender: 'ai', content: aiResult.message, metadata: aiResult },
        ]);
      } catch (e) {
        // Non-blocking history write
      }
    }

    res.json(aiResult);
  } catch (err) {
    next(err);
  }
};

export const getChatSessions = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.json([]);
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    next(err);
  }
};

export const getSessionMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    next(err);
  }
};

export const deleteChatSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Session deleted' });
  } catch (err) {
    next(err);
  }
};

