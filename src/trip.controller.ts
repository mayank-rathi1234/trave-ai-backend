import { Body, Controller, Post } from '@nestjs/common';
import { TravelCoordinatorAgent } from './coordinator.agent';
import { TripRequestDto } from './trip-request.dto';

@Controller('trip')
export class TripController {
  constructor(private coordinator: TravelCoordinatorAgent) {}

  @Post('plan')
  async plan(@Body() request: TripRequestDto) {
    return this.coordinator.execute(request);
  }
}
