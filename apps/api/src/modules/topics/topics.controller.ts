import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/public.decorator.js';
import { TopicsService } from './topics.service.js';

@Public()
@Controller('topics')
export class TopicsController {
  constructor(private readonly topics: TopicsService) {}

  @Get()
  list() {
    return this.topics.list();
  }
}
