import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class OpenAIService {

  private client: GoogleGenAI;

  private readonly model: string;

  constructor(private config: ConfigService) {

    this.client = new GoogleGenAI({
      apiKey: this.config.get<string>('GEMINI_API_KEY'),
    });

    this.model = this.config.get<string>(
      'GEMINI_MODEL',
      'gemini-3.7-flash',
    );
  }

  async ask(prompt: string): Promise<string> {

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    return response.text || '';
  }
}