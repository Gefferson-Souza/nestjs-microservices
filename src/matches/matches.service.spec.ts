import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from './matches.service';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateMatchDto } from './dtos/create-match.dto';
import { PlayersService } from '../players/players.service';
import { CategoriesService } from '../categories/categories.service';

// Mock do modelo mongoose
const mockMatchModel = {
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  save: jest.fn()
};

describe('MatchesService', () => {
  let service: MatchesService;
  let playersService: PlayersService;
  let categoriesService: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        {
          provide: getModelToken('Match'),
          useValue: mockMatchModel
        },
        {
          provide: PlayersService,
          useValue: {
            checkPlayerExists: jest.fn()
          }
        },
        {
          provide: CategoriesService,
          useValue: {
            getCategoryByPlayer: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
    playersService = module.get<PlayersService>(PlayersService);
    categoriesService = module.get<CategoriesService>(CategoriesService);
    
    // Reset dos mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a match successfully', async () => {
      // Arrange
      const matchDto: CreateMatchDto = {
        category: 'A',
        def: 'player1',
        players: [],
        result: []
      };

      const expectedMatch = {
        ...matchDto,
        _id: 'match1'
      };

      jest.spyOn(playersService, 'checkPlayerExists').mockResolvedValue(true);
      jest.spyOn(categoriesService, 'getCategoryByPlayer').mockResolvedValue({
        _id: 'category1',
        category: 'A',
        players: ['player1', 'player2']
      });
      
      mockMatchModel.create.mockResolvedValueOnce(expectedMatch);

      // Act
      const result = await service.create(matchDto);

      // Assert
      expect(result).toEqual(expectedMatch);
      expect(playersService.checkPlayerExists).toHaveBeenCalledTimes(matchDto.players.length + 1); // Players + def
      expect(categoriesService.getCategoryByPlayer).toHaveBeenCalledWith(matchDto.def);
      expect(mockMatchModel.create).toHaveBeenCalledWith(matchDto);
    });

    it('should throw BadRequestException when winner is not in players', async () => {
      // Arrange
      const matchDto: CreateMatchDto = {
        category: 'A',
        def: 'player3', // Não está na lista de jogadores
        players: [{
          playerId: 'player1',
          result: 6
        }, {
          playerId: 'player2',
          result: 3
        }]
      };

      jest.spyOn(playersService, 'checkPlayerExists').mockResolvedValue(true);

      // Act & Assert
      await expect(service.create(matchDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when players are not in the same category', async () => {
      // Arrange
      const matchDto: CreateMatchDto = {
        category: 'A',
        def: 'player1',
        players: [{
          playerId: 'player1',
          result: 6
        }, {
          playerId: 'player2',
          result: 3
        }]
      };

      jest.spyOn(playersService, 'checkPlayerExists').mockResolvedValue(true);
      jest.spyOn(categoriesService, 'getCategoryByPlayer')
        .mockResolvedValueOnce({ category: 'A' })
        .mockResolvedValueOnce({ category: 'B' }); // Categoria diferente

      // Act & Assert
      await expect(service.create(matchDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('list', () => {
    it('should return all matches', async () => {
      // Arrange
      const mockMatches = [
        { _id: 'match1', category: 'A' },
        { _id: 'match2', category: 'B' }
      ];

      mockMatchModel.find.mockResolvedValueOnce(mockMatches);

      // Act
      const result = await service.list();

      // Assert
      expect(result).toEqual(mockMatches);
      expect(mockMatchModel.find).toHaveBeenCalled();
    });

    it('should return empty array when no matches exist', async () => {
      // Arrange
      mockMatchModel.find.mockResolvedValueOnce([]);

      // Act
      const result = await service.list();

      // Assert
      expect(result).toEqual([]);
      expect(mockMatchModel.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return match when found by id', async () => {
      // Arrange
      const matchId = 'match1';
      const mockMatch = { _id: matchId, category: 'A' };

      mockMatchModel.findById.mockResolvedValueOnce(mockMatch);

      // Act
      const result = await service.findById(matchId);

      // Assert
      expect(result).toEqual(mockMatch);
      expect(mockMatchModel.findById).toHaveBeenCalledWith(matchId);
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
      await expect(service.findById(invalidId)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when match not found', async () => {
      // Arrange
      const nonExistentId = 'nonexistent';
      
      mockMatchModel.findById.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.findById(nonExistentId)).rejects.toThrow(NotFoundException);
    });
  });
});