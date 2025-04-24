import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { Category } from './interfaces/category.interface';
@UsePipes(ValidationPipe)
@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private readonly _categoriesService: CategoriesService) {}

  @Post('')
  @ApiOperation({ summary: 'Create new category' })
  @ApiResponse({
    status: 201,
    type: CreateCategoryDto,
  })
  async create(@Body() category: CreateCategoryDto): Promise<Category> {
    return this._categoriesService.create(category);
  }

  @Get('')
  @ApiOperation({ summary: 'List all categories' })
  @ApiResponse({
    status: 200,
    description: 'List categories',
  })
  @ApiResponse({ status: 400, description: 'Error on list categories' })
  async list(): Promise<Category[] | null> {
    return this._categoriesService.list();
  }
}
