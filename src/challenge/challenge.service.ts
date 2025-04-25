import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Challenge, ChallengeStatus } from './interfaces/challenge.interface';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { PlayersService } from '../players/players.service';
import { CategoriesService } from '../categories/categories.service';
import { AssignMatchToChallengeDto } from './dtos/assign-match-to-challenge.dto';
import { MatchesService } from '../matches/matches.service';
import { Match } from '../matches/interfaces/match.interface';

@Injectable()
export class ChallengeService {
  private readonly logger = new Logger(ChallengeService.name);

  constructor(
    @InjectModel('Challenge') 
    private readonly challengeModel: Model<Challenge>,
    
    private readonly playersService: PlayersService,
    
    private readonly categoriesService: CategoriesService,
    
    private readonly matchesService: MatchesService
  ) {}

  async create(createChallengeDto: CreateChallengeDto): Promise<Challenge> {
    const { challengeDateTime, requester, players } = createChallengeDto;
    
    // Validar se o requester é um ID válido
    if (!requester || !isValidObjectId(requester)) {
      throw new BadRequestException(`ID de solicitante inválido: ${requester}`);
    }
    
    // Validar se os jogadores existem e têm IDs válidos
    await Promise.all(
      players.map(async (playerId) => {
        if (!playerId || !isValidObjectId(playerId)) {
          throw new BadRequestException(`ID de jogador inválido: ${playerId}`);
        }
        await this.playersService.getPlayer(playerId);
      })
    );
    
    // Validar se o solicitante é um dos jogadores
    if (!players.includes(requester)) {
      throw new BadRequestException(`O solicitante deve ser um dos jogadores`);
    }
    
    // Obter a categoria do jogador solicitante
    const playerCategory = await this.categoriesService.getCategoryByPlayer(requester);
    
    if (!playerCategory) {
      throw new BadRequestException(`O jogador solicitante não está associado a nenhuma categoria`);
    }
    
    const newChallenge = new this.challengeModel({
      challengeDateTime,
      status: ChallengeStatus.PENDING,
      requestDateTime: new Date(),
      requester,
      category: playerCategory.category,
      players,
    });
    
    try {
      return await newChallenge.save();
    } catch (error) {
      this.logger.error(`Erro ao criar desafio: ${error.message}`);
      throw new InternalServerErrorException('Erro ao criar desafio');
    }
  }

  async findAll(): Promise<Challenge[]> {
    return this.challengeModel
      .find()
      .populate('requester')
      .populate('players')
      .populate('match')
      .exec();
  }

  async findChallengesByPlayer(playerId: string): Promise<Challenge[]> {
    // Verificar se o ID do jogador é válido
    if (!playerId || !isValidObjectId(playerId)) {
      throw new BadRequestException(`ID de jogador inválido: ${playerId}`);
    }
    
    // Verificar se o jogador existe
    await this.playersService.getPlayer(playerId);
    
    return this.challengeModel
      .find({ players: { $in: [playerId] } })
      .populate('requester')
      .populate('players')
      .populate('match')
      .exec();
  }

  async findById(id: string): Promise<Challenge> {
    // Verificar se o ID é válido
    if (!id || !isValidObjectId(id)) {
      throw new BadRequestException(`ID de desafio inválido: ${id}`);
    }
    
    const challenge = await this.challengeModel
      .findById(id)
      .populate('requester')
      .populate('players')
      .populate('match')
      .exec();
      
    if (!challenge) {
      throw new NotFoundException(`Desafio ${id} não encontrado`);
    }
    
    return challenge;
  }

  async update(id: string, updateChallengeDto: UpdateChallengeDto): Promise<void> {
    // Verificar se o ID é válido
    if (!id || !isValidObjectId(id)) {
      throw new BadRequestException(`ID de desafio inválido: ${id}`);
    }
    
    const { status, challengeDateTime } = updateChallengeDto;
    
    // Validar status permitidos para atualização
    if (status && ![ChallengeStatus.ACCEPTED, ChallengeStatus.DENIED, ChallengeStatus.CANCELED].includes(status)) {
      throw new BadRequestException(`Status inválido. Use: ${ChallengeStatus.ACCEPTED}, ${ChallengeStatus.DENIED} ou ${ChallengeStatus.CANCELED}`);
    }
    
    const challenge = await this.findById(id);
    
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      updateData.responseDateTime = new Date();
    }
    
    if (challengeDateTime) {
      updateData.challengeDateTime = challengeDateTime;
    }
    
    try {
      await this.challengeModel.findByIdAndUpdate(id, updateData).exec();
    } catch (error) {
      this.logger.error(`Erro ao atualizar desafio: ${error.message}`);
      throw new InternalServerErrorException('Erro ao atualizar desafio');
    }
  }

  async delete(id: string): Promise<void> {
    // Verificar se o ID é válido
    if (!id || !isValidObjectId(id)) {
      throw new BadRequestException(`ID de desafio inválido: ${id}`);
    }
    
    // Deleção lógica (muda o status para CANCELED)
    await this.findById(id); // Verifica se existe
    
    try {
      await this.challengeModel.findByIdAndUpdate(
        id, 
        { status: ChallengeStatus.CANCELED }
      ).exec();
    } catch (error) {
      this.logger.error(`Erro ao cancelar desafio: ${error.message}`);
      throw new InternalServerErrorException('Erro ao cancelar desafio');
    }
  }

  async assignMatchToChallenge(id: string, assignMatchDto: AssignMatchToChallengeDto): Promise<Match> {
    // Verificar se o ID do desafio é válido
    if (!id || !isValidObjectId(id)) {
      throw new BadRequestException(`ID de desafio inválido: ${id}`);
    }
    
    const { def, result } = assignMatchDto;
    
    // Verificar se o ID do jogador vencedor é válido
    if (!def || !isValidObjectId(def)) {
      throw new BadRequestException(`ID de jogador vencedor inválido: ${def}`);
    }
    
    // Buscar o desafio
    const challenge = await this.findById(id);
    
    // Verificar se o desafio está com status ACEITO
    if (challenge.status !== ChallengeStatus.ACCEPTED) {
      throw new BadRequestException(`Somente desafios aceitos podem ter uma partida atribuída`);
    }
    
    // Verificar se o jogador vencedor faz parte do desafio
    const isPlayerInChallenge = challenge.players.some(player => 
      player._id.toString() === def || player._id === def
    );
    
    if (!isPlayerInChallenge) {
      throw new BadRequestException(`O jogador vencedor deve ser um dos participantes do desafio`);
    }
    
    try {
      // Criar a partida usando o serviço de Partidas
      const playerIds = challenge.players.map(player => 
        typeof player === 'string' ? player : player._id.toString()
      );
      
      const newMatch = await this.matchesService.createMatch({
        category: challenge.category,
        players: playerIds,
        def,
        result
      });
      
      // Atualizar o desafio com a referência à partida criada
      await this.challengeModel.findByIdAndUpdate(
        id,
        {
          status: ChallengeStatus.REALIZED,
          match: newMatch._id
        }
      ).exec();
      
      // Retornar a partida criada
      return newMatch;
    } catch (error) {
      this.logger.error(`Erro ao atribuir partida ao desafio: ${error.message}`);
      throw new InternalServerErrorException('Erro ao atribuir partida ao desafio');
    }
  }
}
