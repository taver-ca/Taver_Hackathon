import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConcertsModule } from './concerts/concerts.module';
import { ConfigModule } from '@nestjs/config';
import { ArtistsModule } from './artists/artists.module';

@Module({
  imports: [ConfigModule.forRoot(), ConcertsModule, ArtistsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
