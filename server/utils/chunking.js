/**
 * Text normalization and chunking utilities for RAG ingestion
 * Supports English, Hindi, and Hinglish without corrupting Devanagari characters.
 */

import crypto from 'crypto';

/**
 * Normalizes text while preserving Unicode / Devanagari characters
 * @param {string} str - Raw text
 * @returns {string} Clean normalized string
 */
export const normalizeText = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

/**
 * Computes deterministic hash to prevent duplicate database ingestion
 * @param {string} input - Text or unique composite key
 * @returns {string} SHA-256 hash
 */
export const computeDocumentHash = (input) => {
  return crypto.createHash('sha256').update(input).digest('hex');
};

/**
 * Splits long text content into overlapping chunks
 * @param {string} text - Input text
 * @param {number} maxWords - Maximum words per chunk (default 120)
 * @param {number} overlap - Overlapping words between consecutive chunks (default 25)
 * @returns {string[]} Array of chunked text
 */
export const chunkText = (text, maxWords = 120, overlap = 25) => {
  if (!text) return [];
  const words = text.split(/\s+/);
  if (words.length <= maxWords) {
    return [text];
  }

  const chunks = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + maxWords, words.length);
    const chunk = words.slice(start, end).join(' ');
    chunks.push(chunk);

    if (end >= words.length) break;
    start += maxWords - overlap;
  }

  return chunks;
};

