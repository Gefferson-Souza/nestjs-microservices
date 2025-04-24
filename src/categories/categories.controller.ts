import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
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
  async list(): Promise<Category[] | []> {
    return this._categoriesService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by id' })
  @ApiResponse({
    status: 200,
    description: 'Get category by id',
  })
  @ApiResponse({
    status: 404,
    description: `Category with specific id not found`,
  })
  async findById(
    @Param('id') id: string,
  ): Promise<Category | NotFoundException> {
    return this._categoriesService.findById(id);
  }

  @Post(':id')
  @ApiOperation({ summary: 'Update category by id' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: `Category with specific id not found`,
  })
  @ApiResponse({
    status: 400,
    description: 'Error on update category',
  })
  async update(
    @Param('id') id: string,
    @Body() category: CreateCategoryDto,
  ): Promise<Category | NotFoundException | null> {
    return this._categoriesService.update(id, category);
  }

  @Post(':id/players/:playerId')
  @ApiOperation({ summary: 'Add player to category' })
  @ApiResponse({
    status: 200,
    description: 'Player added to category successfully',
  })
  @ApiResponse({
    status: 404,
    description: `Category or player with specific id not found`,
  })
  @ApiResponse({
    status: 400,
    description: 'Error on add player to category',
  })
  async addPlayerToCategory(
    @Param('id') id: string,
    @Param('playerId') playerId: string,
  ): Promise<Category | NotFoundException | null> {
    return this._categoriesService.addPlayerToCategory(id, playerId);
  }
}
