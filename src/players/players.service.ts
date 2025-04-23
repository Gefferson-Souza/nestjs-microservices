import { ConflictException, Injectable } from '@nestjs/common';
import { createPlayerDto } from './dtos/create-player.dto';
import { Player } from './interface/player.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PlayersService {

    constructor(
        @InjectModel('Player')
        private readonly _playerModel: Model<Player>,
    ){}

  async create(player: createPlayerDto): Promise<Player> {
    await this.exists(player.email);

    const newPlayer:Player = new this._playerModel(player);
    await newPlayer.save();

    return newPlayer;
  }

  async list(): Promise<Player[]> {
    const players:Player[] = await this._playerModel.find({}).lean();
    return players;
  }

  async exists(email: string): Promise<boolean> {
    if(await this._playerModel.findOne({ email })){
        throw new ConflictException('Email already exists');
    };

    return false
  }
}
