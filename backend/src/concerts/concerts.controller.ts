import { Controller, Get, Param } from '@nestjs/common';
import { ConcertsService } from './concerts.service';

@Controller('concerts')
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  @Get()
  findOne(@Param('artistName') artistName: string) {
    return this.concertsService.findOne(artistName);
  }
}
