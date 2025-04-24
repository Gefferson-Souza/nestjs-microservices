import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { Category } from './interfaces/category.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category')
    private readonly _categoryModel: Model<Category>,
  ) {}

  async create(category: CreateCategoryDto): Promise<Category> {
    const newCategory = await this._categoryModel.create(category);
    return newCategory;
  }

  async list(): Promise<Category[] | null> {
    const categories: Category[] = await this._categoryModel.find({});
    return categories;
  }
}
