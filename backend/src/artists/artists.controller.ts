import { Controller, Get, Param } from '@nestjs/common';
import { ArtistsService } from './artists.service';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get('top')
  findAll(
    @Param('code') code: string,
    @Param('code_verifier') code_verifier: string,
  ) {
    return this.artistsService.findAll(code, code_verifier);
  }
}
