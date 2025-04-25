import { Document } from 'mongoose';
import { Player } from '../../players/interface/player.interface';

export interface Challenge extends Document {
  challengeDateTime: Date;
  status: ChallengeStatus;
  requestDateTime: Date;
  responseDateTime?: Date;
  requester: Player; 
  category: string; 
  players: Array<Player>; 
  match?: any; // Referência ao ID da partida
}

export enum ChallengeStatus {
  REALIZED = 'REALIZADO',
  PENDING = 'PENDENTE',
  DENIED = 'NEGADO',
  ACCEPTED = 'ACEITO',
  CANCELED = 'CANCELADO',
}
