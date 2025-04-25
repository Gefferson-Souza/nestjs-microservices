import { Test, TestingModule } from '@nestjs/testing';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { UpdatePutPlayerDto } from './dtos/update-put-player.dto';
import { NotFoundException } from '@nestjs/common';

describe('PlayersController', () => {
  let controller: PlayersController;
  let service: PlayersService;

  // Mock do PlayersService
  const mockPlayersService = {
    create: jest.fn(),
    list: jest.fn(),
    getPlayer: jest.fn(),
    update: jest.fn(),
    updatePartial: jest.fn(),
    removePlayer: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayersController],
      providers: [
        {
          provide: PlayersService,
          useValue: mockPlayersService
        }
      ]
    }).compile();

    controller = module.get<PlayersController>(PlayersController);
    service = module.get<PlayersService>(PlayersService);

    // Reset mocks após cada teste
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPlayer', () => {
    it('should create a player', async () => {
      // Arrange
      const createPlayerDto: CreatePlayerDto = {
        name: 'Test Player',
        email: 'test@example.com',
        phone: '123456789'
      };

      const expectedResult = {
        ...createPlayerDto,
        _id: 'player1'
      };

      mockPlayersService.create.mockResolvedValueOnce(expectedResult);

      // Act
      const result = await controller.create(createPlayerDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createPlayerDto);
    });
  });

  describe('listPlayers', () => {
    it('should return a list of players', async () => {
      // Arrange
      const mockPlayers = [
        { _id: '1', name: 'Player 1', email: 'player1@example.com' },
        { _id: '2', name: 'Player 2', email: 'player2@example.com' }
      ];
      mockPlayersService.list.mockResolvedValueOnce(mockPlayers);

      // Act
      const result = await controller.list();

      // Assert
      expect(result).toEqual(mockPlayers);
      expect(service.list).toHaveBeenCalled();
    });
  });

  describe('getPlayerById', () => {
    it('should return a player by id', async () => {
      // Arrange
      const playerId = 'player1';
      const mockPlayer = { _id: playerId, name: 'Player 1', email: 'player1@example.com' };
      mockPlayersService.getPlayer.mockResolvedValueOnce(mockPlayer);

      // Act
      const result = await controller.getPlayer(playerId);

      // Assert
      expect(result).toEqual(mockPlayer);
      expect(service.getPlayer).toHaveBeenCalledWith(playerId);
    });

    it('should throw NotFoundException when player not found', async () => {
      // Arrange
      const playerId = 'nonexistent';
      mockPlayersService.getPlayer.mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(controller.getPlayer(playerId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePlayer', () => {
    it('should update a player', async () => {
      // Arrange
      const playerId:string = 'player1';
      const updateDto: UpdatePutPlayerDto = {
        _id: playerId,
        name: 'Updated Player',
        email: 'updated@example.com',
        phone: '987654321'
      };
      const updatedPlayer = {...updateDto };
      mockPlayersService.update.mockResolvedValueOnce(updatedPlayer);

      // Act
      const result = await controller.update(updateDto, playerId);

      // Assert
      expect(result).toEqual(updatedPlayer);
      expect(service.update).toHaveBeenCalledWith(playerId, updateDto);
    });
  });


  describe('deletePlayer', () => {
    it('should delete a player', async () => {
      // Arrange
      const playerId = 'player1';
      const deletedPlayer = { _id: playerId, name: 'Deleted Player' };
      mockPlayersService.removePlayer.mockResolvedValueOnce(deletedPlayer);

      // Act
      const result = await controller.delete(playerId);

      // Assert
      expect(result).toEqual(deletedPlayer);
      expect(service.removePlayer).toHaveBeenCalledWith(playerId);
    });
  });
});
