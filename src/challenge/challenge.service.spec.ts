import { Test, TestingModule } from '@nestjs/testing';
import { ChallengeService } from './challenge.service';
import { getModelToken } from '@nestjs/mongoose';
import { CategoriesService } from '../categories/categories.service';
import { PlayersService } from '../players/players.service';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { AssignMatchToChallengeDto } from './dtos/assign-match-to-challenge.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ChallengeStatus } from './interfaces/challenge.interface';

// Mock dos models mongoose
const mockChallengeModel = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  populate: jest.fn(),
  exec: jest.fn()
};

const mockMatchModel = {
  create: jest.fn(),
  save: jest.fn()
};

// Mocks para populate
mockChallengeModel.find.mockReturnValue({
  populate: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([])
});

mockChallengeModel.findById.mockReturnValue({
  populate: jest.fn().mockReturnThis(),
  exec: jest.fn()
});

// Mock de session do mongoose
const mockSession = {
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  abortTransaction: jest.fn(),
  endSession: jest.fn()
};

jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  startSession: jest.fn().mockResolvedValue(mockSession)
}));

describe('ChallengeService', () => {
  let service: ChallengeService;
  let categoriesService: CategoriesService;
  let playersService: PlayersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChallengeService,
        {
          provide: getModelToken('Challenge'),
          useValue: mockChallengeModel
        },
        {
          provide: getModelToken('Match'),
          useValue: mockMatchModel
        },
        {
          provide: PlayersService,
          useValue: {
            getPlayer: jest.fn().mockResolvedValue({ _id: 'player1' }),
            checkPlayerExists: jest.fn().mockResolvedValue(true)
          }
        },
        {
          provide: CategoriesService,
          useValue: {
            getCategoryByPlayer: jest.fn().mockResolvedValue({ category: 'A' })
          }
        }
      ],
    }).compile();

    service = module.get<ChallengeService>(ChallengeService);
    categoriesService = module.get<CategoriesService>(CategoriesService);
    playersService = module.get<PlayersService>(PlayersService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a challenge successfully', async () => {
      // Arrange
      const createChallengeDto: CreateChallengeDto = {
        challengeDateTime: new Date(),
        requester: 'player1',
        players: ['player1', 'player2']
      };

      const expectedChallenge = {
        ...createChallengeDto,
        status: ChallengeStatus.PENDING,
        requestDateTime: expect.any(Date),
        category: 'A'
      };

      mockChallengeModel.save = jest.fn().mockResolvedValueOnce(expectedChallenge);
      
      // Mock para o constructor do model
      const mockConstructor = jest.fn().mockImplementation(() => ({
        save: mockChallengeModel.save
      }));
      
      // @ts-ignore - Overriding constructor
      service['challengeModel'] = jest.fn().mockImplementation(() => mockConstructor());

      // Act
      const result = await service.create(createChallengeDto);

      // Assert
      expect(playersService.getPlayer).toHaveBeenCalledTimes(2);
      expect(categoriesService.getCategoryByPlayer).toHaveBeenCalledWith('player1');
      expect(result).toEqual(expectedChallenge);
    });

    it('should throw BadRequestException when requester is not in players list', async () => {
      // Arrange
      const createChallengeDto: CreateChallengeDto = {
        challengeDateTime: new Date(),
        requester: 'player3',
        players: ['player1', 'player2']
      };

      // Act & Assert
      await expect(service.create(createChallengeDto)).rejects.toThrow(BadRequestException);
      expect(playersService.getPlayer).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException when requester has no category', async () => {
      // Arrange
      const createChallengeDto: CreateChallengeDto = {
        challengeDateTime: new Date(),
        requester: 'player1',
        players: ['player1', 'player2']
      };

      jest.spyOn(categoriesService, 'getCategoryByPlayer').mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.create(createChallengeDto)).rejects.toThrow(BadRequestException);
      expect(categoriesService.getCategoryByPlayer).toHaveBeenCalledWith('player1');
    });
  });

  describe('findAll', () => {
    it('should return all challenges', async () => {
      // Arrange
      const mockChallenges = [
        { _id: '1', category: 'A' },
        { _id: '2', category: 'B' }
      ];
      
      mockChallengeModel.find().populate().exec.mockResolvedValueOnce(mockChallenges);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockChallenges);
      expect(mockChallengeModel.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a challenge by id', async () => {
      // Arrange
      const mockChallenge = { _id: '1', category: 'A' };
      mockChallengeModel.findById().populate().exec.mockResolvedValueOnce(mockChallenge);

      // Act
      const result = await service.findById('1');

      // Assert
      expect(result).toEqual(mockChallenge);
      expect(mockChallengeModel.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when challenge not found', async () => {
      // Arrange
      mockChallengeModel.findById().populate().exec.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update challenge status', async () => {
      // Arrange
      const updateDto: UpdateChallengeDto = {
        status: ChallengeStatus.ACCEPTED
      };
      
      const mockChallenge = { _id: '1', status: ChallengeStatus.PENDING };
      jest.spyOn(service, 'findById').mockResolvedValueOnce(mockChallenge as any);
      
      mockChallengeModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({ ...mockChallenge, status: updateDto.status })
      });

      // Act
      await service.update('1', updateDto);

      // Assert
      expect(service.findById).toHaveBeenCalledWith('1');
      expect(mockChallengeModel.findByIdAndUpdate).toHaveBeenCalledWith('1', {
        status: ChallengeStatus.ACCEPTED,
        responseDateTime: expect.any(Date)
      });
    });

    it('should throw BadRequestException when status is invalid', async () => {
      // Arrange
      const updateDto: UpdateChallengeDto = {
        status: ChallengeStatus.PENDING
      };

      // Act & Assert
      await expect(service.update('1', updateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('assignMatchToChallenge', () => {
    it('should assign match to challenge', async () => {
      // Arrange
      const assignDto: AssignMatchToChallengeDto = {
        def: 'player1',
        result: [{ set: '6-4' }]
      };
      
      const mockChallenge = {
        _id: '1',
        status: ChallengeStatus.ACCEPTED,
        category: 'A',
        players: [
          { _id: 'player1', toString: () => 'player1' },
          { _id: 'player2', toString: () => 'player2' }
        ]
      };
      
      jest.spyOn(service, 'findById').mockResolvedValueOnce(mockChallenge as any);
      
      const savedMatch = { _id: 'match1' };
      mockMatchModel.save = jest.fn().mockResolvedValueOnce(savedMatch);
      
      // Mock para o constructor do model
      const mockMatchConstructor = jest.fn().mockImplementation(() => ({
        save: mockMatchModel.save
      }));
      
      // @ts-ignore - Overriding constructor
      service['matchModel'] = jest.fn().mockImplementation(() => mockMatchConstructor());
      
      mockChallengeModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({})
      });

      // Act
      await service.assignMatchToChallenge('1', assignDto);

      // Assert
      expect(service.findById).toHaveBeenCalledWith('1');
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should throw BadRequestException when challenge status is not ACCEPTED', async () => {
      // Arrange
      const assignDto: AssignMatchToChallengeDto = {
        def: 'player1',
        result: [{ set: '6-4' }]
      };
      
      const mockChallenge = {
        _id: '1',
        status: ChallengeStatus.PENDING,
        players: []
      };
      
      jest.spyOn(service, 'findById').mockResolvedValueOnce(mockChallenge as any);

      // Act & Assert
      await expect(service.assignMatchToChallenge('1', assignDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when winner is not in players list', async () => {
      // Arrange
      const assignDto: AssignMatchToChallengeDto = {
        def: 'player3',
        result: [{ set: '6-4' }]
      };
      
      const mockChallenge = {
        _id: '1',
        status: ChallengeStatus.ACCEPTED,
        players: [
          { _id: 'player1', toString: () => 'player1' },
          { _id: 'player2', toString: () => 'player2' }
        ]
      };
      
      jest.spyOn(service, 'findById').mockResolvedValueOnce(mockChallenge as any);

      // Act & Assert
      await expect(service.assignMatchToChallenge('1', assignDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete (cancel) a challenge', async () => {
      // Arrange
      const mockChallenge = { _id: '1', status: ChallengeStatus.PENDING };
      jest.spyOn(service, 'findById').mockResolvedValueOnce(mockChallenge as any);
      
      mockChallengeModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({ ...mockChallenge, status: ChallengeStatus.CANCELED })
      });

      // Act
      await service.delete('1');

      // Assert
      expect(service.findById).toHaveBeenCalledWith('1');
      expect(mockChallengeModel.findByIdAndUpdate).toHaveBeenCalledWith('1', {
        status: ChallengeStatus.CANCELED
      });
    });
  });
});
