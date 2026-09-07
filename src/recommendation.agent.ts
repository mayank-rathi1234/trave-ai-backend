import { Injectable } from '@nestjs/common';
import { OpenAIService } from './openai/openai.service';

export interface RecommendationResult {
  attractions: string[];
  restaurants: string[];
  hiddenGems: string[];
}

@Injectable()
export class RecommendationAgent {
  constructor(private openAI: OpenAIService) {}

  async execute(destination: string): Promise<RecommendationResult> {
    const prompt = `
You are a Local Travel Guide for ${destination}.

Recommend:

- Attractions
- Restaurants
- Hidden Gems

Return JSON.
`;

    const result = await this.openAI.ask(prompt);

const cleanedResult = result
  .replace(/```json/g, '')
  .replace(/```/g, '')
  .trim();

return JSON.parse(cleanedResult) as RecommendationResult;
  }
}
