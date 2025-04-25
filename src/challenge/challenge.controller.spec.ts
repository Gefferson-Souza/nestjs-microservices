import { Test, TestingModule } from '@nestjs/testing';
import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { AssignMatchToChallengeDto } from './dtos/assign-match-to-challenge.dto';
import { ChallengeStatus } from './interfaces/challenge.interface';

describe('ChallengeController', () => {
  let controller: ChallengeController;
  let service: ChallengeService;

  // Mock do ChallengeService
  const mockChallengeService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findChallengesByPlayer: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    assignMatchToChallenge: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChallengeController],
      providers: [
        {
          provide: ChallengeService,
          useValue: mockChallengeService
        }
      ]
    }).compile();

    controller = module.get<ChallengeController>(ChallengeController);
    service = module.get<ChallengeService>(ChallengeService);

    // Reset mocks após cada teste
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createChallenge', () => {
    it('should create a challenge', async () => {
      // Arrange
      const createChallengeDto: CreateChallengeDto = {
        challengeDateTime: new Date(),
        requester: 'player1',
        players: ['player1', 'player2']
      };

      const expectedResult = {
        ...createChallengeDto,
        _id: 'challenge1',
        status: ChallengeStatus.PENDING,
        category: 'A'
      };

      mockChallengeService.create.mockResolvedValueOnce(expectedResult);

      // Act
      const result = await controller.createChallenge(createChallengeDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createChallengeDto);
    });
  });

  describe('findAll', () => {
    it('should return all challenges when no playerId provided', async () => {
      // Arrange
      const mockChallenges = [
        { _id: '1', category: 'A' },
        { _id: '2', category: 'B' }
      ];
      mockChallengeService.findAll.mockResolvedValueOnce(mockChallenges);

      // Act
      const result = await controller.findAll(undefined);

      // Assert
      expect(result).toEqual(mockChallenges);
      expect(service.findAll).toHaveBeenCalled();
      expect(service.findChallengesByPlayer).not.toHaveBeenCalled();
    });

    it('should return player challenges when playerId provided', async () => {
      // Arrange
      const playerId = 'player1';
      const mockChallenges = [
        { _id: '1', category: 'A', players: [{ _id: playerId }] }
      ];
      mockChallengeService.findChallengesByPlayer.mockResolvedValueOnce(mockChallenges);

      // Act
      const result = await controller.findAll(playerId);

      // Assert
      expect(result).toEqual(mockChallenges);
      expect(service.findChallengesByPlayer).toHaveBeenCalledWith(playerId);
      expect(service.findAll).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find a challenge by id', async () => {
      // Arrange
      const mockChallenge = { _id: '1', category: 'A' };
      mockChallengeService.findById.mockResolvedValueOnce(mockChallenge);

      // Act
      const result = await controller.findOne('1');

      // Assert
      expect(result).toEqual(mockChallenge);
      expect(service.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a challenge', async () => {
      // Arrange
      const updateDto: UpdateChallengeDto = {
        status: ChallengeStatus.ACCEPTED
      };
      mockChallengeService.update.mockResolvedValueOnce(undefined);

      // Act
      await controller.update('1', updateDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a challenge', async () => {
      // Arrange
      mockChallengeService.delete.mockResolvedValueOnce(undefined);

      // Act
      await controller.delete('1');

      // Assert
      expect(service.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('assignMatch', () => {
    it('should assign a match to a challenge', async () => {
      // Arrange
      const assignDto: AssignMatchToChallengeDto = {
        def: 'player1',
        result: [{ set: '6-4' }]
      };
      mockChallengeService.assignMatchToChallenge.mockResolvedValueOnce(undefined);

      // Act
      await controller.assignMatch('1', assignDto);

      // Assert
      expect(service.assignMatchToChallenge).toHaveBeenCalledWith('1', assignDto);
    });
  });
});
