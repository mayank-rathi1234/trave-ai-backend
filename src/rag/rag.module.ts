// src/rag/rag.module.ts
import { Module } from '@nestjs/common';
import { WikivoyageService } from './wikivoyage.service';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-store.service';
import { RetrievalService } from './retrieval.service';

@Module({
  providers: [
    WikivoyageService,
    EmbeddingService,
    VectorStoreService,
    RetrievalService,
  ],
  exports: [RetrievalService],
})
export class RagModule {}