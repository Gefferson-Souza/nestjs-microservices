import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  // Mock do CategoriesService
  const mockCategoriesService = {
    create: jest.fn(),
    list: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    addPlayerToCategory: jest.fn(),
    getCategoryByPlayer: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService
        }
      ]
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);

    // Reset mocks após cada teste
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
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
        ]
      };

      const expectedResult = {
        ...categoryDto,
        _id: 'category1',
        players: []
      };

      mockCategoriesService.create.mockResolvedValueOnce(expectedResult);

      // Act
      const result = await controller.create(categoryDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(categoryDto);
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      // Arrange
      const mockCategories = [
        { _id: 'category1', category: 'A', description: 'Advanced', players: [] },
        { _id: 'category2', category: 'B', description: 'Beginner', players: [] }
      ];
      mockCategoriesService.list.mockResolvedValueOnce(mockCategories);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(mockCategories);
      expect(service.list).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      // Arrange
      const categoryId = 'category1';
      const mockCategory = { _id: categoryId, category: 'A', description: 'Advanced', players: [] };
      mockCategoriesService.findById.mockResolvedValueOnce(mockCategory);

      // Act
      const result = await controller.findOne(categoryId);

      // Assert
      expect(result).toEqual(mockCategory);
      expect(service.findById).toHaveBeenCalledWith(categoryId);
    });

    it('should throw NotFoundException when category not found', async () => {
      // Arrange
      const categoryId = 'nonexistent';
      mockCategoriesService.findById.mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(controller.findOne(categoryId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
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
        ...updateDto,
        players: []
      };
      mockCategoriesService.update.mockResolvedValueOnce(updatedCategory);

      // Act
      const result = await controller.update(categoryId, updateDto);

      // Assert
      expect(result).toEqual(updatedCategory);
      expect(service.update).toHaveBeenCalledWith(categoryId, updateDto);
    });
  });

  describe('addPlayerToCategory', () => {
    it('should add a player to a category', async () => {
      // Arrange
      const categoryId = 'category1';
      const playerId = 'player1';
      const updatedCategory = { 
        _id: categoryId, 
        category: 'A', 
        description: 'Advanced', 
        players: [playerId]
      };
      
      mockCategoriesService.addPlayerToCategory.mockResolvedValueOnce(updatedCategory);

      // Act
      const result = await controller.addPlayerToCategory(categoryId, { playerId });

      // Assert
      expect(result).toEqual(updatedCategory);
      expect(service.addPlayerToCategory).toHaveBeenCalledWith(categoryId, playerId);
    });

    it('should throw BadRequestException when player id is invalid', async () => {
      // Arrange
      const categoryId = 'category1';
      const playerId = 'invalid';
      
      mockCategoriesService.addPlayerToCategory.mockRejectedValueOnce(
        new BadRequestException(`Player ID invalid not valid`)
      );

      // Act & Assert
      await expect(controller.addPlayerToCategory(categoryId, { playerId }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getCategoryByPlayer', () => {
    it('should return a category by player id', async () => {
      // Arrange
      const playerId = 'player1';
      const mockCategory = { 
        _id: 'category1', 
        category: 'A', 
        description: 'Advanced', 
        players: [playerId]
      };
      
      mockCategoriesService.getCategoryByPlayer.mockResolvedValueOnce(mockCategory);

      // Act
      const result = await controller.getCategoryByPlayer(playerId);

      // Assert
      expect(result).toEqual(mockCategory);
      expect(service.getCategoryByPlayer).toHaveBeenCalledWith(playerId);
    });

    it('should return null when player has no category', async () => {
      // Arrange
      const playerId = 'player1';
      
      mockCategoriesService.getCategoryByPlayer.mockResolvedValueOnce(null);

      // Act
      const result = await controller.getCategoryByPlayer(playerId);

      // Assert
      expect(result).toBeNull();
      expect(service.getCategoryByPlayer).toHaveBeenCalledWith(playerId);
    });

    it('should throw BadRequestException when player id is invalid', async () => {
      // Arrange
      const playerId = 'invalid';
      
      mockCategoriesService.getCategoryByPlayer.mockRejectedValueOnce(
        new BadRequestException(`Player ID invalid not valid`)
      );

      // Act & Assert
      await expect(controller.getCategoryByPlayer(playerId))
        .rejects.toThrow(BadRequestException);
    });
  });
});
