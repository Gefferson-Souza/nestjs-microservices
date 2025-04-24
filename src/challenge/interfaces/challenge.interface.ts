import { Document } from 'mongoose';
import { Player } from '../../players/interface/player.interface';

export interface Challenge extends Document {
  challengeDateTime: Date;
  status: ChallengeStatus;
  requestDateTime: Date;
  responseDateTime?: Date;
  requester: Player; // Referência ao jogador solicitante
  category: string; // Mantido como string conforme exemplo JSON
  players: Array<Player>; // Array de jogadores participantes
  match?: Match; // Partida associada (opcional)
}

export enum ChallengeStatus {
  REALIZED = 'REALIZADO',
  PENDING = 'PENDENTE',
  DENIED = 'NEGADO',
  ACCEPTED = 'ACEITO', // Adicionando status intermediário
  CANCELED = 'CANCELADO', // Adicionando status
}

// Interface para a partida aninhada
export interface Match extends Document {
  category: string;
  players: Array<Player>;
  def: Player; // Jogador que definiu/venceu a partida
  result: Array<Result>;
}

// Interface para o resultado de cada set
export interface Result {
  set: string;
}