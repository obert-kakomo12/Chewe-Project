import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MaterialsService } from './materials.service';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.materialsService.create(createDto);
  }

  @Get('class/:className')
  findByClass(@Param('className') className: string) {
    return this.materialsService.findByClass(className);
  }

  @Get()
  findAll() {
    return this.materialsService.findAll();
  }
}
