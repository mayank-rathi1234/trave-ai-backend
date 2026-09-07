import { Injectable } from '@nestjs/common';
import { AccommodationDetails } from './budget.agent';
import { OpenAIService } from './openai/openai.service';
import { parseJsonResponse } from './openai/parse-json';

export interface ItineraryDay {
  day: number;
  location?: string;
  activities: string[];
  accommodation?: AccommodationDetails | string;
}

export interface ItineraryResult {
  itinerary: ItineraryDay[];
}

@Injectable()
export class ItineraryAgent {
  constructor(private openAI: OpenAIService) {}

  async execute(data: Record<string, unknown>): Promise<ItineraryResult> {
    const request = data.request as Record<string, unknown> | undefined;
    const days = Number(request?.days ?? 1);

    const prompt = `
Create a day-wise itinerary for ${days} day(s).

Use the research, budget, recommendations, and request below.
If budget.accommodation exists, use that exact hotel for every overnight stay.

${JSON.stringify(data)}

Return JSON only with this shape:
{
  "itinerary": [
    {
      "day": 1,
      "location": "City or area name",
      "activities": ["activity 1", "activity 2"],
      "accommodation": {
        "hotelName": "Same hotel from budget.accommodation",
        "roomType": "Room category",
        "roomDetails": "Bed type, inclusions, view",
        "checkIn": "2:00 PM",
        "checkOut": "11:00 AM",
        "address": "Hotel area"
      }
    }
  ]
}

Rules:
- Return exactly ${days} day object(s)
- accommodation must match budget.accommodation.hotelName when provided
- activities should be specific and time-ordered within each day
`;

    const result = await this.openAI.ask(prompt);

    return parseJsonResponse<ItineraryResult>(result);
  }
}
