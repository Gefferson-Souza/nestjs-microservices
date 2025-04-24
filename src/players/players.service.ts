import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { Player } from './interface/player.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdatePutPlayerDto } from './dtos/update-put-player.dto';

@Injectable()
export class PlayersService {

    constructor(
        @InjectModel('Player')
        private readonly _playerModel: Model<Player>,
    ){}

  async create(player: CreatePlayerDto): Promise<Player> {
    await this.emailExists(player.email);

    const newPlayer:Player = new this._playerModel(player);
    await newPlayer.save();

    return newPlayer;
  }

  async list(): Promise<Player[]> {
    const players:Player[] = await this._playerModel.find({}).lean();
    return players;
  }

  async emailExists(email: string): Promise<boolean> {
    if(await this._playerModel.findOne({ email })){
        throw new ConflictException('Email already exists');
    };

    return false
  }

  async checkPlayerExists(_id: string): Promise<Boolean | NotFoundException> {
    const player: Player | null = await this._playerModel.findById(_id).lean();
    if(!player){
      throw new NotFoundException('Player not found');
    };
    return true;
  }

  private async updatePlayer<T extends Partial<CreatePlayerDto>>(id: string, player: T): Promise<Player | null> {
    await this.checkPlayerExists(id);

    if(player.email) {
      await this.emailExists(player.email);
    }

    return this._playerModel.findByIdAndUpdate(
      id, 
      player,
      { new: true }
    ).lean();
  }

  async update(id: string, player: UpdatePutPlayerDto): Promise<Player | null> {
    return this.updatePlayer(id, player);
  }

  async updatePartial(id: string, player: Partial<CreatePlayerDto>): Promise<Player | null> {
    return this.updatePlayer(id, player);
  }

  async removePlayer(id: string): Promise<Player | null> {
    await this.checkPlayerExists(id);

    const deletedUser: Player | null = await this._playerModel.findByIdAndDelete(id).lean();
    return deletedUser;
  }
}
