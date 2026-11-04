/**
 * Supabase Vector Similarity Retrieval Service
 * Performs cosine distance match using match_knowledge_chunks RPC
 */
import { supabase } from '../config/supabase.js';
import { getEmbedding } from '../../rag/scripts/generateEmbeddings.js';

/**
 * Retrieve top relevant medical chunks from Supabase pgvector
 * @param {string} userQuery - Patient question or symptom description
 * @param {Object} options - matchCount, threshold, dataset filter
 * @returns {Promise<Array>} Ranked relevant knowledge chunks
 */
export const retrieveRelevantContext = async (userQuery, { matchCount = 4, threshold = 0.40, filterDataset = null } = {}) => {
  if (!userQuery || !userQuery.trim()) return [];

  try {
    // 1. Generate 768-dim embedding for user query
    const queryEmbedding = await getEmbedding(userQuery);

    // 2. Call Supabase RPC match_knowledge_chunks
    const { data: chunks, error } = await supabase.rpc('match_knowledge_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: matchCount,
      filter_dataset: filterDataset,
    });

    if (error) {
      console.warn('[Retrieval Service] RPC match error:', error.message);
      return [];
    }

    return chunks || [];
  } catch (err) {
    console.warn('[Retrieval Service] Retrieval exception:', err.message);
    return [];
  }
};

