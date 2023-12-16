import { Module } from '@nestjs/common';
import { ConcertsService } from './concerts.service';
import { ConcertsController } from './concerts.controller';

@Module({
  controllers: [ConcertsController],
  providers: [ConcertsService],
})
export class ConcertsModule {}
