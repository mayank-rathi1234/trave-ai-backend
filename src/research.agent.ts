import { Injectable } from '@nestjs/common';
import { OpenAIService } from './openai/openai.service';
import { RetrievalService } from './rag/retrieval.service';

export interface ResearchResult {
  weather: string;
  bestTime: string;
  attractions: string[];
}

@Injectable()
export class ResearchAgent {
  constructor(
    private openAI: OpenAIService,
    private retrievalService: RetrievalService,   // inject kiya
  ) {}

  async execute(destination: string): Promise<ResearchResult> {
    // RAG se relevant context nikaalo Wikivoyage se
    const context = await this.retrievalService.getContextForDestination(
      destination,
      `${destination} attractions, weather, best time to visit, culture`,
    );

    
    const contextSection = context.length > 0
      ? `\nUse the following real travel guide information as your primary source:\n${context.join('\n\n')}\n`
      : '';

    const prompt = `
You are a Travel Research Agent.
${contextSection}
Research ${destination}

Return JSON:

{
  "weather":"",
  "bestTime":"",
  "attractions":[]
}
`;

    const result = await this.openAI.ask(prompt);

    const cleanedResult = result
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleanedResult) as ResearchResult;
  }
}
