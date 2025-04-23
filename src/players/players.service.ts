import { Injectable } from '@nestjs/common';
import { createPlayerDto } from './dtos/create-player.dto';
import { Player } from './interface/player.interface';

@Injectable()
export class PlayersService {
  async create(player: createPlayerDto): Promise<Player> {
    return {
      _id: '123456789',
      phone: player.phone,
      email: player.email,
      name: player.name,
      ranking: 'Gold',
      rankingPosition: 1,
      avatar: 'https://example.com/avatar.png',
    };
  }

  async list(): Promise<Player[]> {
    let player1: Player = {
      _id: '987654321',
      phone: '123-456-7890',
      email: 'player2@example.com',
      name: 'Player Two',
      ranking: 'Silver',
      rankingPosition: 2,
      avatar: 'https://example.com/avatar2.png',
    };
    const array: Player[] = [];
    array.push(player1);
    array.push(player1);
    return array;
  }
}
