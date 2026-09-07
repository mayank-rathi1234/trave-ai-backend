// src/rag/vector-store.service.ts
import { Injectable } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

interface StoredChunk {
  id: number;
  destination: string;
  content: string;
  embedding: string;
}

@Injectable()
export class VectorStoreService {
  private db: Database.Database;

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(dataDir, 'travelgenie.db');
    this.db = new Database(dbPath);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS destination_docs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        destination TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding TEXT NOT NULL
      )
    `);
  }

  // Naya chunk save karo
  saveChunk(destination: string, content: string, embedding: number[]) {
    const stmt = this.db.prepare(
      `INSERT INTO destination_docs (destination, content, embedding) VALUES (?, ?, ?)`,
    );
    stmt.run(destination.toLowerCase(), content, JSON.stringify(embedding));
  }

  // Check karo destination pehle se hai ya nahi
  hasDestination(destination: string): boolean {
    const stmt = this.db.prepare(
      `SELECT COUNT(*) as count FROM destination_docs WHERE destination = ?`,
    );
    const result = stmt.get(destination.toLowerCase()) as { count: number };
    return result.count > 0;
  }

  // Ek destination ke saare chunks nikaalo
  getChunksByDestination(destination: string): StoredChunk[] {
    const stmt = this.db.prepare(
      `SELECT * FROM destination_docs WHERE destination = ?`,
    );
    return stmt.all(destination.toLowerCase()) as StoredChunk[];
  }

  // Cosine similarity se best matching chunks dhundo
  searchSimilar(queryEmbedding: number[], destination: string, topK = 5): string[] {
    const chunks = this.getChunksByDestination(destination);

    if (chunks.length === 0) return [];

    const scored = chunks.map((chunk) => {
      const chunkEmbedding = JSON.parse(chunk.embedding) as number[];
      const score = this.cosineSimilarity(queryEmbedding, chunkEmbedding);
      return { content: chunk.content, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map((s) => s.content);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magA * magB);
  }
}