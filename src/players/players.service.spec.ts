import { Test, TestingModule } from '@nestjs/testing';
import { PlayersService } from './players.service';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { UpdatePutPlayerDto } from './dtos/update-put-player.dto';

// Mock do modelo mongoose
const mockPlayerModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  exec: jest.fn(),
  save: jest.fn()
};

describe('PlayersService', () => {
  let service: PlayersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayersService,
        {
          provide: getModelToken('Player'),
          useValue: mockPlayerModel
        }
      ],
    }).compile();

    service = module.get<PlayersService>(PlayersService);
    
    // Reset dos mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPlayer', () => {
    it('should create a player successfully', async () => {
      // Arrange
      const playerDto: CreatePlayerDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123456789'
      };

      const expectedPlayer = {
        ...playerDto,
        _id: 'player1',
        ranking: 'A',
        rankingPosition: 1,
        photoUrl: 'url-da-foto'
      };

      mockPlayerModel.findOne.mockResolvedValueOnce(null); // Nenhum jogador com este email
      mockPlayerModel.create.mockResolvedValueOnce(expectedPlayer);

      // Act
      const result = await service.create(playerDto);

      // Assert
      expect(result).toEqual(expectedPlayer);
      expect(mockPlayerModel.findOne).toHaveBeenCalledWith({ email: playerDto.email });
      expect(mockPlayerModel.create).toHaveBeenCalledWith(playerDto);
    });

    it('should throw BadRequestException when player with email already exists', async () => {
      // Arrange
      const playerDto: CreatePlayerDto = {
        name: 'John Doe',
        email: 'existing@example.com',
        phone: '123456789'
      };

      mockPlayerModel.findOne.mockResolvedValueOnce({ 
        _id: 'existingPlayer',
        email: playerDto.email
      });

      // Act & Assert
      await expect(service.create(playerDto)).rejects.toThrow(BadRequestException);
      expect(mockPlayerModel.findOne).toHaveBeenCalledWith({ email: playerDto.email });
      expect(mockPlayerModel.create).not.toHaveBeenCalled();
    });
  });

  describe('getAllPlayers', () => {
    it('should return all players', async () => {
      // Arrange
      const mockPlayers = [
        { _id: 'player1', name: 'John Doe' },
        { _id: 'player2', name: 'Jane Smith' }
      ];

      mockPlayerModel.find.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockPlayers)
      });

      // Act
      const result = await service.list();

      // Assert
      expect(result).toEqual(mockPlayers);
      expect(mockPlayerModel.find).toHaveBeenCalled();
    });

    it('should return empty array when no players exist', async () => {
      // Arrange
      mockPlayerModel.find.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce([])
      });

      // Act
      const result = await service.list();

      // Assert
      expect(result).toEqual([]);
      expect(mockPlayerModel.find).toHaveBeenCalled();
    });
  });

  describe('getPlayerById', () => {
    it('should return player when found by id', async () => {
      // Arrange
      const playerId = 'player1';
      const mockPlayer = { _id: playerId, name: 'John Doe' };

      mockPlayerModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockPlayer)
      });

      // Act
      const result = await service.getPlayer(playerId);

      // Assert
      expect(result).toEqual(mockPlayer);
      expect(mockPlayerModel.findById).toHaveBeenCalledWith(playerId);
    });

    it('should throw NotFoundException when player not found', async () => {
      // Arrange
      const nonExistentId = 'nonexistent';
      
      mockPlayerModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null)
      });

      // Act & Assert
      await expect(service.getPlayer(nonExistentId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePlayer', () => {
    it('should update player successfully', async () => {
      // Arrange
      const playerId:string = 'player1';
      const updateDto: UpdatePutPlayerDto = {
        _id: playerId,
        name: 'Updated Name',
        email: 'updated.email@example.com',
        phone: '987654321'
      };

      const updatedPlayer = {
        ...updateDto
      };

      mockPlayerModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({ _id: playerId })
      });

      mockPlayerModel.findByIdAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(updatedPlayer)
      });

      // Act
      const result = await service.update(playerId, updateDto);

      // Assert
      expect(result).toEqual(updatedPlayer);
      expect(mockPlayerModel.findById).toHaveBeenCalledWith(playerId);
      expect(mockPlayerModel.findByIdAndUpdate).toHaveBeenCalledWith(
        playerId,
        updateDto,
        { new: true }
      );
    });

    it('should throw NotFoundException when player to update not found', async () => {
      // Arrange
      const nonExistentId = 'nonexistent';
      const updateDto: UpdatePutPlayerDto = {
        _id: nonExistentId,
        name: 'Updated Name',
        email: 'updated.email@example.com',
        phone: '987654321'
      };

      mockPlayerModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null)
      });

      // Act & Assert
      await expect(service.update(nonExistentId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePlayer', () => {
    it('should delete player successfully', async () => {
      // Arrange
      const playerId = 'player1';
      
      mockPlayerModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({ _id: playerId })
      });

      mockPlayerModel.findByIdAndDelete.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(true)
      });

      // Act & Assert
      await expect(service.removePlayer(playerId)).resolves.not.toThrow();
      expect(mockPlayerModel.findById).toHaveBeenCalledWith(playerId);
      expect(mockPlayerModel.findByIdAndDelete).toHaveBeenCalledWith(playerId);
    });

    it('should throw NotFoundException when player to delete not found', async () => {
      // Arrange
      const nonExistentId = 'nonexistent';
      
      mockPlayerModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null)
      });

      // Act & Assert
      await expect(service.removePlayer(nonExistentId)).rejects.toThrow(NotFoundException);
    });
  });
  
  describe('checkPlayerExists', () => {
    it('should return true when player exists', async () => {
      // Arrange
      const playerId = 'player1';
      
      mockPlayerModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({ _id: playerId })
      });

      // Act
      const result = await service.checkPlayerExists(playerId);

      // Assert
      expect(result).toBe(true);
      expect(mockPlayerModel.findById).toHaveBeenCalledWith(playerId);
    });

    it('should return false when player does not exist', async () => {
      // Arrange
      const nonExistentId = 'nonexistent';
      
      mockPlayerModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null)
      });

      // Act
      const result = await service.checkPlayerExists(nonExistentId);

      // Assert
      expect(result).toBe(false);
      expect(mockPlayerModel.findById).toHaveBeenCalledWith(nonExistentId);
    });
  });
});
