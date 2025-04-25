import { Document } from 'mongoose';
import { Player } from '../../players/interface/player.interface';

export interface Result {
  set: string;
}

export interface Match extends Document {
  category: string;
  players: Array<Player>;
  def: Player; // jogador vencedor
  result: Result[];
}