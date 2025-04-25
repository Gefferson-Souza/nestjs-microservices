import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PlayersService } from '../players/players.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { Model } from 'mongoose';
import { Category } from './interfaces/category.interface';

// Mock do modelo mongoose
const mockCategoryModel = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn()
};

describe('CategoriesService', () => {
  let service: CategoriesService;
  let playersService: PlayersService;
  let model: Model<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getModelToken('Category'),
          useValue: mockCategoryModel
        },
        {
          provide: PlayersService,
          useValue: {
            checkPlayerExists: jest.fn().mockResolvedValue(true)
          }
        }
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    playersService = module.get<PlayersService>(PlayersService);
    model = module.get<Model<Category>>(getModelToken('Category'));

    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      // Arrange
      const categoryDto: CreateCategoryDto = {
        category: 'A',
        description: 'Advanced players',
        events: [
          {
            name: 'POINTS',
            operation: 'ADD',
            value: 100
          }
        ],
        players: ['player1']
      };

      const expectedCategory = {
        ...categoryDto,
        _id: 'category1'
      };

      mockCategoryModel.create.mockResolvedValueOnce(expectedCategory);

      // Act
      const result = await service.create(categoryDto);

      // Assert
      expect(result).toEqual(expectedCategory);
      expect(mockCategoryModel.create).toHaveBeenCalledWith({
        ...categoryDto,
        players: categoryDto.players || []
      });
    });

    it('should handle case when players is not provided', async () => {
      // Arrange
      const categoryDtoWithoutPlayers: CreateCategoryDto = {
        category: 'B',
        description: 'Beginner players',
        events: [
          {
            name: 'POINTS',
            operation: 'ADD',
            value: 50
          }
        ]
      };

      const expectedCategory = {
        ...categoryDtoWithoutPlayers,
        players: [],
        _id: 'category2'
      };

      mockCategoryModel.create.mockResolvedValueOnce(expectedCategory);

      // Act
      const result = await service.create(categoryDtoWithoutPlayers);

      // Assert
      expect(result).toEqual(expectedCategory);
      expect(mockCategoryModel.create).toHaveBeenCalledWith({
        ...categoryDtoWithoutPlayers,
        players: []
      });
    });
  });

  describe('list', () => {
    it('should return all categories', async () => {
      // Arrange
      const mockCategories = [
        { _id: 'category1', category: 'A' },
        { _id: 'category2', category: 'B' }
      ];

      mockCategoryModel.find.mockResolvedValueOnce(mockCategories);

      // Act
      const result = await service.list();

      // Assert
      expect(result).toEqual(mockCategories);
      expect(mockCategoryModel.find).toHaveBeenCalledWith({});
    });

    it('should return empty array when no categories exist', async () => {
      // Arrange
      mockCategoryModel.find.mockResolvedValueOnce([]);

      // Act
      const result = await service.list();

      // Assert
      expect(result).toEqual([]);
      expect(mockCategoryModel.find).toHaveBeenCalledWith({});
    });
  });

  describe('findById', () => {
    it('should return category when found by id', async () => {
      // Arrange
      const categoryId = 'category1';
      const mockCategory = { _id: categoryId, category: 'A' };
      
      jest.spyOn(service, 'categoryExists').mockResolvedValueOnce(mockCategory);

      // Act
      const result = await service.findById(categoryId);

      // Assert
      expect(result).toEqual(mockCategory);
      expect(service.categoryExists).toHaveBeenCalledWith(categoryId);
    });

    it('should throw BadRequestException for invalid id', async () => {
      // Arrange
      const invalidId = 'invalid';
      
      jest.spyOn(service, 'categoryExists').mockRejectedValueOnce(
        new BadRequestException(`ID de categoria inválido: ${invalidId}`)
      );

      // Act & Assert
      await expect(service.findById(invalidId)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when category not found', async () => {
      // Arrange
      const nonExistentId = 'nonexistent';
      
      jest.spyOn(service, 'categoryExists').mockRejectedValueOnce(
        new NotFoundException(`Category with id ${nonExistentId} not found`)
      );

      // Act & Assert
      await expect(service.findById(nonExistentId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('categoryExists', () => {
    it('should return category when found', async () => {
      // Arrange
      const categoryId = 'category1';
      const mockCategory = { _id: categoryId, category: 'A' };
      mockCategoryModel.findById.mockResolvedValueOnce(mockCategory);

      // Act
      const result = await service.categoryExists(categoryId);

      // Assert
      expect(result).toEqual(mockCategory);
      expect(mockCategoryModel.findById).toHaveBeenCalledWith(categoryId);
    });

    it('should throw BadRequestException for invalid id', async () => {
      // Arrange
      const invalidId = 'invalid';
      
      // Simular isValidObjectId retornando falso
      jest.mock('mongoose', () => ({
        ...jest.requireActual('mongoose'),
        isValidObjectId: jest.fn().mockReturnValue(false)
      }));

      // Act & Assert
      await expect(service.categoryExists(invalidId)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when category not found', async () => {
      // Arrange
      const nonExistentId = 'nonexistent';
      mockCategoryModel.findById.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.categoryExists(nonExistentId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a category successfully', async () => {
      // Arrange
      const categoryId = 'category1';
      const updateDto: CreateCategoryDto = {
        category: 'Updated',
        description: 'Updated description',
        events: [
          {
            name: 'POINTS',
            operation: 'ADD',
            value: 200
          }
        ]
      };

      const updatedCategory = {
        _id: categoryId,
        ...updateDto
      };

      jest.spyOn(service, 'categoryExists').mockResolvedValueOnce({ _id: categoryId });
      mockCategoryModel.findByIdAndUpdate.mockResolvedValueOnce(updatedCategory);

      // Act
      const result = await service.update(categoryId, updateDto);

      // Assert
      expect(result).toEqual(updatedCategory);
      expect(service.categoryExists).toHaveBeenCalledWith(categoryId);
      expect(mockCategoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
        categoryId,
        { $set: updateDto },
        { new: true }
      );
    });
  });

  describe('addPlayerToCategory', () => {
    it('should add a player to a category successfully', async () => {
      // Arrange
      const categoryId = 'category1';
      const playerId = 'player1';
      
      const updatedCategory = {
        _id: categoryId,
        category: 'A',
        players: [playerId]
      };

      jest.spyOn(playersService, 'checkPlayerExists').mockResolvedValueOnce(true);
      jest.spyOn(service, 'categoryExists').mockResolvedValueOnce({ _id: categoryId });
      mockCategoryModel.findByIdAndUpdate.mockResolvedValueOnce(updatedCategory);

      // Act
      const result = await service.addPlayerToCategory(categoryId, playerId);

      // Assert
      expect(result).toEqual(updatedCategory);
      expect(playersService.checkPlayerExists).toHaveBeenCalledWith(playerId);
      expect(service.categoryExists).toHaveBeenCalledWith(categoryId);
      expect(mockCategoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
        categoryId,
        { $push: { players: playerId } },
        { new: true }
      );
    });
  });

  describe('getCategoryByPlayer', () => {
    it('should find a category by player id', async () => {
      // Arrange
      const playerId = 'player1';
      const mockCategory = { 
        _id: 'category1', 
        category: 'A',
        players: [playerId]
      };

      jest.spyOn(playersService, 'checkPlayerExists').mockResolvedValueOnce(true);
      mockCategoryModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockCategory)
      });

      // Act
      const result = await service.getCategoryByPlayer(playerId);

      // Assert
      expect(result).toEqual(mockCategory);
      expect(playersService.checkPlayerExists).toHaveBeenCalledWith(playerId);
      expect(mockCategoryModel.findOne).toHaveBeenCalledWith({
        players: { $in: [playerId] }
      });
    });

    it('should throw BadRequestException for invalid player id', async () => {
      // Arrange
      const invalidId = 'invalid';
      
      // Simular isValidObjectId retornando falso
      jest.mock('mongoose', () => ({
        ...jest.requireActual('mongoose'),
        isValidObjectId: jest.fn().mockReturnValue(false)
      }));

      // Act & Assert
      await expect(service.getCategoryByPlayer(invalidId)).rejects.toThrow(BadRequestException);
    });

    it('should return null when player has no category', async () => {
      // Arrange
      const playerId = 'player1';
      
      jest.spyOn(playersService, 'checkPlayerExists').mockResolvedValueOnce(true);
      mockCategoryModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null)
      });

      // Act
      const result = await service.getCategoryByPlayer(playerId);

      // Assert
      expect(result).toBeNull();
      expect(playersService.checkPlayerExists).toHaveBeenCalledWith(playerId);
      expect(mockCategoryModel.findOne).toHaveBeenCalledWith({
        players: { $in: [playerId] }
      });
    });
  });
});
