import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dtos/create-match.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('MatchesController', () => {
  let controller: MatchesController;
  let service: MatchesService;

  // Mock do MatchesService
  const mockMatchesService = {
    createMatch: jest.fn(),
    findAll: jest.fn(),
    findByPlayerId: jest.fn(),
    findByCategory: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [
        {
          provide: MatchesService,
          useValue: mockMatchesService
        }
      ]
    }).compile();

    controller = module.get<MatchesController>(MatchesController);
    service = module.get<MatchesService>(MatchesService);

    // Reset mocks
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMatch', () => {
    it('should create a match', async () => {
      // Arrange
      const matchDto: CreateMatchDto = {
        category: 'A',
        def: 'player1',
        players: ['player1', 'player2'],
        result: [{ set: '6-4' }]
      };

      const expectedResult = {
        ...matchDto,
        _id: 'match1'
      };

      mockMatchesService.createMatch.mockResolvedValueOnce(expectedResult);

      // Act
      const result = await controller.createMatch(matchDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.createMatch).toHaveBeenCalledWith(matchDto);
    });

    it('should throw BadRequestException for invalid match data', async () => {
      // Arrange
      const invalidMatchDto: CreateMatchDto = {
        category: 'A',
        def: 'player3', // Jogador que não está na partida
        players: ['player1', 'player2'],
        result: [{ set: '6-4' }]
      };

      mockMatchesService.createMatch.mockRejectedValueOnce(
        new BadRequestException('O jogador vencedor deve ser um dos participantes da partida')
      );

      // Act & Assert
      await expect(controller.createMatch(invalidMatchDto)).rejects.toThrow(BadRequestException);
      expect(service.createMatch).toHaveBeenCalledWith(invalidMatchDto);
    });
  });

  describe('findAll', () => {
    it('should return all matches when no parameters provided', async () => {
      // Arrange
      const mockMatches = [
        { _id: 'match1', category: 'A' },
        { _id: 'match2', category: 'B' }
      ];
      mockMatchesService.findAll.mockResolvedValueOnce(mockMatches);

      // Act
      const result = await controller.findAll('undefined', 'undefined');

      // Assert
      expect(result).toEqual(mockMatches);
      expect(service.findAll).toHaveBeenCalled();
      expect(service.findByPlayerId).not.toHaveBeenCalled();
      expect(service.findByCategory).not.toHaveBeenCalled();
    });

    it('should return player matches when playerId provided', async () => {
      // Arrange
      const playerId = 'player1';
      const mockMatches = [
        { _id: 'match1', category: 'A', players: ['player1', 'player2'] }
      ];
      mockMatchesService.findByPlayerId.mockResolvedValueOnce(mockMatches);

      // Act
      const result = await controller.findAll(playerId, 'undefined');

      // Assert
      expect(result).toEqual(mockMatches);
      expect(service.findByPlayerId).toHaveBeenCalledWith(playerId);
      expect(service.findAll).not.toHaveBeenCalled();
      expect(service.findByCategory).not.toHaveBeenCalled();
    });

    it('should return category matches when category provided', async () => {
      // Arrange
      const category = 'A';
      const mockMatches = [
        { _id: 'match1', category: 'A', players: ['player1', 'player2'] }
      ];
      mockMatchesService.findByCategory.mockResolvedValueOnce(mockMatches);

      // Act
      const result = await controller.findAll('undefined', category);

      // Assert
      expect(result).toEqual(mockMatches);
      expect(service.findByCategory).toHaveBeenCalledWith(category);
      expect(service.findAll).not.toHaveBeenCalled();
      expect(service.findByPlayerId).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a match by id', async () => {
      // Arrange
      const matchId = 'match1';
      const mockMatch = { 
        _id: matchId, 
        category: 'A',
        def: 'player1',
        players: ['player1', 'player2'],
        result: [{ set: '6-4' }]
      };
      mockMatchesService.findById.mockResolvedValueOnce(mockMatch);

      // Act
      const result = await controller.findOne(matchId);

      // Assert
      expect(result).toEqual(mockMatch);
      expect(service.findById).toHaveBeenCalledWith(matchId);
    });

    it('should throw NotFoundException when match not found', async () => {
      // Arrange
      const matchId = 'nonexistent';
      mockMatchesService.findById.mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(controller.findOne(matchId)).rejects.toThrow(NotFoundException);
      expect(service.findById).toHaveBeenCalledWith(matchId);
    });

    it('should throw BadRequestException for invalid id', async () => {
      // Arrange
      const invalidId = 'invalid';
      mockMatchesService.findById.mockRejectedValueOnce(
        new BadRequestException(`ID de partida inválido: ${invalidId}`)
      );

      // Act & Assert
      await expect(controller.findOne(invalidId)).rejects.toThrow(BadRequestException);
      expect(service.findById).toHaveBeenCalledWith(invalidId);
    });
  });
});