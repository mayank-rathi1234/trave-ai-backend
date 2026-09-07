import { Injectable } from '@nestjs/common';
import { BudgetAgent, BudgetResult } from './budget.agent';
import { ItineraryAgent, ItineraryResult } from './itinerary.agent';
import {
  RecommendationAgent,
  RecommendationResult,
} from './recommendation.agent';
import { ResearchAgent, ResearchResult } from './research.agent';
import { TripRequestDto } from './trip-request.dto';

export interface TravelPlanResult {
  research: ResearchResult;
  budget: BudgetResult;
  recommendations: RecommendationResult;
  itinerary: ItineraryResult;
}

@Injectable()
export class TravelCoordinatorAgent {
  constructor(
    private researchAgent: ResearchAgent,
    private budgetAgent: BudgetAgent,
    private recommendationAgent: RecommendationAgent,
    private itineraryAgent: ItineraryAgent,
  ) {}

  async execute(request: TripRequestDto): Promise<TravelPlanResult> {
    const research = await this.researchAgent.execute(request.destination);

    const budget = await this.budgetAgent.execute(request);

    const recommendations = await this.recommendationAgent.execute(
      request.destination,
    );

    const itinerary = await this.itineraryAgent.execute({
      research,
      budget,
      recommendations,
      request,
    });

    return {
      research,
      budget,
      recommendations,
      itinerary,
    };
  }
}
