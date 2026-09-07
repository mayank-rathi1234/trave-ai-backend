import { Injectable } from '@nestjs/common';
import { OpenAIService } from './openai/openai.service';
import { parseJsonResponse } from './openai/parse-json';
import { TripRequestDto } from './trip-request.dto';

export interface AccommodationDetails {
  hotelName: string;
  roomType?: string;
  roomDetails?: string;
  nights?: number;
  rooms?: number;
  pricePerNight?: number;
  totalCost?: number;
  address?: string;
  checkIn?: string;
  checkOut?: string;
  amenities?: string[];
}

export interface BudgetResult {
  transport: number;
  hotel: number;
  food: number;
  activities: number;
  total: number;
  accommodation?: AccommodationDetails;
}

@Injectable()
export class BudgetAgent {
  constructor(private openAI: OpenAIService) {}

  async execute(request: TripRequestDto): Promise<BudgetResult> {
    const nights = Math.max(1, request.days - 1);
    const rooms = Math.max(1, Math.ceil(request.travelers / 2));

    const prompt = `
You are a Budget Planning Agent.

Trip Details:

${JSON.stringify(request)}

Recommend one realistic hotel for this trip and allocate the hotel budget to it.
Use ${nights} night(s) and ${rooms} room(s).

Return JSON only:

{
  "transport": 0,
  "hotel": 0,
  "food": 0,
  "activities": 0,
  "total": 0,
  "accommodation": {
    "hotelName": "Specific hotel or resort name in ${request.destination}",
    "roomType": "e.g. Deluxe Double Room",
    "roomDetails": "e.g. 2 queen beds, breakfast included, city view",
    "nights": ${nights},
    "rooms": ${rooms},
    "pricePerNight": 0,
    "totalCost": 0,
    "address": "Neighborhood or area",
    "checkIn": "2:00 PM",
    "checkOut": "11:00 AM",
    "amenities": ["WiFi", "Breakfast"]
  }
}

Rules:
- hotel must equal accommodation.totalCost (or pricePerNight * nights * rooms)
- total must equal transport + hotel + food + activities
- hotelName must be a plausible property for ${request.destination}
`;

    const result = await this.openAI.ask(prompt);

    return parseJsonResponse<BudgetResult>(result);
  }
}
