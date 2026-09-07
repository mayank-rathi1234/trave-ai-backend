// src/rag/retrieval.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { WikivoyageService } from './wikivoyage.service';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-store.service';

@Injectable()
export class RetrievalService {
  private readonly logger = new Logger(RetrievalService.name);

  constructor(
    private wikivoyageService: WikivoyageService,
    private embeddingService: EmbeddingService,
    private vectorStore: VectorStoreService,
  ) {}

  async getContextForDestination(destination: string, query: string): Promise<string[]> {
    const alreadyExists = this.vectorStore.hasDestination(destination);

    if (!alreadyExists) {
      this.logger.log(`Cache miss for "${destination}" — fetching from Wikivoyage...`);
      await this.ingestDestination(destination);
    } else {
      this.logger.log(`Cache hit for "${destination}"`);
    }

    const queryEmbedding = await this.embeddingService.generateEmbedding(query);
    const relevantChunks = this.vectorStore.searchSimilar(queryEmbedding, destination, 5);

    return relevantChunks;
  }

  private async ingestDestination(destination: string): Promise<void> {
    const articleText = await this.wikivoyageService.fetchArticle(destination);

    if (!articleText) {
      this.logger.warn(`No Wikivoyage data found for "${destination}"`);
      return;
    }

    const chunks = this.splitIntoChunks(articleText, 500);

    for (const chunk of chunks) {
      const embedding = await this.embeddingService.generateEmbedding(chunk);
      this.vectorStore.saveChunk(destination, chunk, embedding);
    }

    this.logger.log(`Ingested ${chunks.length} chunks for "${destination}"`);
  }

  private splitIntoChunks(text: string, maxWords: number): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += maxWords) {
      chunks.push(words.slice(i, i + maxWords).join(' '));
    }
    return chunks.filter((c) => c.trim().length > 0);
  }
}