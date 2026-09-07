import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BudgetAgent } from './budget.agent';
import { TravelCoordinatorAgent } from './coordinator.agent';
import { ItineraryAgent } from './itinerary.agent';
import { OpenAIService } from './openai/openai.service';
import { RecommendationAgent } from './recommendation.agent';
import { ResearchAgent } from './research.agent';
import { TripController } from './trip.controller';
import { RagModule } from './rag/rag.module';   

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RagModule,   // ADD KIYA
  ],
  controllers: [AppController, TripController],
  providers: [
    AppService,
    OpenAIService,
    ResearchAgent,
    BudgetAgent,
    RecommendationAgent,
    ItineraryAgent,
    TravelCoordinatorAgent,
  ],
})
export class AppModule {}
