/**
 * Centralized Google Gemini API Client
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('[Gemini Config] Notice: GEMINI_API_KEY is not defined in environment variables. Add it to .env');
}

export const genAI = new GoogleGenerativeAI(apiKey || 'DUMMY_KEY');

export const GEMINI_CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-flash';
export const GEMINI_EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';

