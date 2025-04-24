import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { Category } from './interfaces/category.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlayersService } from '../players/players.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category')
    private readonly _categoryModel: Model<Category>,
    private readonly _playerSerice: PlayersService,
  ) {}

  async create(category: CreateCategoryDto): Promise<Category> {
    const newCategory = await this._categoryModel.create(category);
    return newCategory;
  }

  async list(): Promise<Category[] | []> {
    const categories: Category[] = await this._categoryModel.find({});
    return categories;
  }

  async findById(id: string): Promise<Category | NotFoundException> {
    return this.categoryExists(id);
  }

  async categoryExists(id: string): Promise<NotFoundException | Category> {
    const category: Category | null = await this._categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    return category;
  }

  async update(
    id: string,
    category: CreateCategoryDto,
  ): Promise<Category | NotFoundException | null> {
    const categoryExists = await this.categoryExists(id);

    return this._categoryModel.findByIdAndUpdate(
      id,
      { $set: category },
      { new: true },
    );
  }

  async addPlayerToCategory(
    id: string,
    playerId: string,
  ): Promise<Category | NotFoundException | null> {
    await Promise.all([
      this._playerSerice.checkPlayerExists(playerId),
      this.categoryExists(id),
    ]);

    return this._categoryModel.findByIdAndUpdate(
      id,
      { $push: { players: playerId } },
      { new: true },
    );
  }
}
