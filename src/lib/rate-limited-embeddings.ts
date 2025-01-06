import { Document } from "@langchain/core/documents";
import pTimeout from 'p-timeout';
import { generateEmbedding, summarizeCode } from './gemini';

// Define interfaces for our data structures
interface EmbeddingResult {
  summary: string;
  embedding: number[];
  sourceCode: string;
  fileName: string;
}

interface ApiError extends Error {
  status?: number;
}

// Configuration constants
const RETRY_DELAYS: readonly number[] = [1000, 2000, 4000, 8000] as const;
const MAX_CONCURRENT_REQUESTS = 5;
const REQUEST_TIMEOUT = 10000;

// Utility function for sleep
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

export const generateEmbeddings = async (docs: Document[]): Promise<EmbeddingResult[]> => {
  const queue = [...docs];
  const results: EmbeddingResult[] = [];
  let activeRequests = 0;
  
  const processDocument = async (doc: Document): Promise<EmbeddingResult> => {
    for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
      try {
        const result = await pTimeout(
          (async () => {
            console.log(`Processing ${doc.metadata.source}, attempt ${attempt + 1}`);
            const summary = await summarizeCode(doc);
            const embedding = await generateEmbedding(summary);
            
            return {
              summary,
              embedding,
              sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
              fileName: doc.metadata.source
            };
          })(),
          {
            milliseconds: REQUEST_TIMEOUT,
            message: 'Request timed out'
          }
        );
        
        return result;
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.status === 429) {
          if (attempt < RETRY_DELAYS.length) {
            const delay = RETRY_DELAYS[attempt];
            console.log(`Rate limited, waiting ${delay}ms before retry`);
            await sleep(delay!);
            continue;
          }
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  };

  const processQueue = async (): Promise<void> => {
    while (queue.length > 0 || activeRequests > 0) {
      if (queue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
        const doc = queue.shift();
        if (!doc) continue;
        
        activeRequests++;
        
        try {
          const result = await processDocument(doc);
          results.push(result);
        } catch (error) {
          console.error(`Failed to process ${doc.metadata.source}:`, error);
        } finally {
          activeRequests--;
        }
      } else {
        await sleep(100);
      }
    }
  };

  await processQueue();
  return results;
};