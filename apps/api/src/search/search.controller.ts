import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * Global search
   */
  @Get()
  async search(
    @Query('q') query: string,
    @Query('type') type?: string,
    @Query('skills') skills?: string,
  ) {
    const skillIds = skills ? skills.split(',') : [];
    const results = await this.searchService.searchAll(query, {
      type,
      skillIds,
    });
    return results;
  }
}
