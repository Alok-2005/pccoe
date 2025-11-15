// File: server/src/services/vector.service.ts
import { Pinecone } from '@pinecone-database/pinecone';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

const MOCK_MODE = process.env.MOCK_MODE === 'true';
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
const PINECONE_INDEX = process.env.PINECONE_INDEX || 'climate-health';

// Local file-based vector store for mock mode
class LocalVectorStore {
  private vectors: Array<{ id: string; content: string; embedding: number[]; metadata: any }> = [];
  private filePath: string;

  constructor() {
    this.filePath = path.join(__dirname, '../../data/local-vectors.json');
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        this.vectors = JSON.parse(data);
        logger.info(`Loaded ${this.vectors.length} vectors from local store`);
      }
    } catch (error) {
      logger.warn('Failed to load local vectors, starting fresh');
      this.vectors = [];
    }
  }

  private save() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.vectors, null, 2));
    } catch (error) {
      logger.error('Failed to save local vectors:', error);
    }
  }

  async addDocuments(docs: Array<{ content: string; metadata?: any }>) {
    for (const doc of docs) {
      this.vectors.push({
        id: `doc-${Date.now()}-${Math.random()}`,
        content: doc.content,
        embedding: this.mockEmbedding(doc.content),
        metadata: doc.metadata || {}
      });
    }
    this.save();
  }

  async similaritySearch(query: string, k: number = 3) {
    const queryEmbedding = this.mockEmbedding(query);
    
    // Calculate cosine similarity
    const scored = this.vectors.map(vec => ({
      ...vec,
      score: this.cosineSimilarity(queryEmbedding, vec.embedding)
    }));

    // Sort by score and return top k
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(item => ({
        content: item.content,
        source: item.metadata.source || 'Unknown',
        relevanceScore: item.score
      }));
  }

  private mockEmbedding(text: string): number[] {
    // Simple deterministic "embedding" based on text characteristics
    const embedding = new Array(384).fill(0);
    for (let i = 0; i < text.length && i < embedding.length; i++) {
      embedding[i] = (text.charCodeAt(i) % 100) / 100;
    }
    return embedding;
  }

  private cosineSimilarity(a: number[], b: number[]): number {const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magA * magB);
  }
}

// Pinecone-based vector store
class PineconeVectorStore {
  private client: Pinecone;
  private index: any;

  constructor() {
    this.client = new Pinecone({
      apiKey: PINECONE_API_KEY!
    });
    this.index = this.client.index(PINECONE_INDEX);
  }

  async addDocuments(docs: Array<{ content: string; metadata?: any }>) {
    // In production, you would generate embeddings using OpenAI or similar
    // For now, using mock embeddings
    const vectors = docs.map((doc, i) => ({
      id: `doc-${Date.now()}-${i}`,
      values: this.mockEmbedding(doc.content),
      metadata: {
        content: doc.content,
        ...doc.metadata
      }
    }));

    await this.index.upsert(vectors);
  }

  async similaritySearch(query: string, k: number = 3) {
    const queryEmbedding = this.mockEmbedding(query);
    
    const results = await this.index.query({
      vector: queryEmbedding,
      topK: k,
      includeMetadata: true
    });

    return results.matches.map((match: any) => ({
      content: match.metadata.content,
      source: match.metadata.source || 'Unknown',
      relevanceScore: match.score
    }));
  }

  private mockEmbedding(text: string): number[] {
    const embedding = new Array(384).fill(0);
    for (let i = 0; i < text.length && i < embedding.length; i++) {
      embedding[i] = (text.charCodeAt(i) % 100) / 100;
    }
    return embedding;
  }
}

let vectorStoreInstance: LocalVectorStore | PineconeVectorStore | null = null;

export const getVectorStore = () => {
  if (!vectorStoreInstance) {
    if (MOCK_MODE || !PINECONE_API_KEY) {
      logger.info('Initializing local vector store (mock mode)');
      vectorStoreInstance = new LocalVectorStore();
    } else {
      logger.info('Initializing Pinecone vector store');
      vectorStoreInstance = new PineconeVectorStore();
    }
  }
  return vectorStoreInstance;
};