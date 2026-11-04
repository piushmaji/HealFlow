/**
 * Google Gemini Embedding Service
 * Uses model text-embedding-004 (768 dimensions) with batching and backoff
 */
import { genAI, GEMINI_EMBEDDING_MODEL } from '../../server/config/gemini.js';

/**
 * Generate embedding for a single text string
 * @param {string} text - Input text
 * @returns {Promise<number[]>} Array of 768 float numbers
 */
export const getEmbedding = async (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Input text must be a non-empty string');
  }

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_EMBEDDING_MODEL });
    const result = await model.embedContent({
      content: { parts: [{ text }] },
      outputDimensionality: 768,
    });
    return result.embedding.values;
  } catch (err) {
    console.error(`[Embedding Error] Failed to generate embedding: ${err.message}`);
    throw err;
  }
};

/**
 * Generate embeddings for an array of text chunks with batching & rate limit handling
 * @param {string[]} texts - Array of strings
 * @param {number} batchSize - Batch size (default 20)
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
export const getBatchEmbeddings = async (texts, batchSize = 20) => {
  const embeddings = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (txt) => {
        try {
          return await getEmbedding(txt);
        } catch (e) {
          console.warn(`[Batch Embedding Retry] Retrying chunk after error: ${e.message}`);
          await new Promise((res) => setTimeout(res, 1200));
          return await getEmbedding(txt);
        }
      })
    );

    embeddings.push(...batchResults);
    // Short breather between batches to respect rate limits
    if (i + batchSize < texts.length) {
      await new Promise((res) => setTimeout(res, 400));
    }
  }

  return embeddings;
};

