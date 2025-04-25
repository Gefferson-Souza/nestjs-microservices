import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Match } from './interfaces/match.interface';
import { CreateMatchDto } from './dtos/create-match.dto';
import { PlayersService } from '../players/players.service';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    @InjectModel('Match') private readonly matchModel: Model<Match>,
    private readonly playersService: PlayersService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async createMatch(createMatchDto: CreateMatchDto): Promise<Match> {
    const { category, players, def, result } = createMatchDto;
    
    // Validar se o ID do jogador vencedor é válido
    if (!isValidObjectId(def)) {
      throw new BadRequestException(`ID de jogador vencedor inválido: ${def}`);
    }
    
    // Validar se os IDs dos jogadores são válidos
    for (const playerId of players) {
      if (!isValidObjectId(playerId)) {
        throw new BadRequestException(`ID de jogador inválido: ${playerId}`);
      }
      
      // Verificar se o jogador existe
      await this.playersService.getPlayer(playerId);
    }
    
    // Verificar se o jogador vencedor está na lista de jogadores
    if (!players.includes(def)) {
      throw new BadRequestException(`O jogador vencedor deve estar na lista de jogadores da partida`);
    }
    
    // Verificar se a categoria existe
    await this.categoriesService.getCategoryByName(category);
    
    // Criar e salvar a nova partida
    const newMatch = new this.matchModel({
      category,
      players,
      def,
      result,
    });
    
    try {
      return await newMatch.save();
    } catch (error) {
      this.logger.error(`Erro ao criar partida: ${error.message}`);
      throw new InternalServerErrorException('Erro ao criar partida');
    }
  }

  async findAll(): Promise<Match[]> {
    return this.matchModel
      .find()
      .populate('players')
      .populate('def')
      .exec();
  }

  async findById(id: string): Promise<Match> {
    // Verificar se o ID é válido
    if (!id || !isValidObjectId(id)) {
      throw new BadRequestException(`ID de partida inválido: ${id}`);
    }
    
    const match = await this.matchModel
      .findById(id)
      .populate('players')
      .populate('def')
      .exec();
      
    if (!match) {
      throw new NotFoundException(`Partida ${id} não encontrada`);
    }
    
    return match;
  }

  async findByPlayerId(playerId: string): Promise<Match[]> {
    // Verificar se o ID do jogador é válido
    if (!playerId || !isValidObjectId(playerId)) {
      throw new BadRequestException(`ID de jogador inválido: ${playerId}`);
    }
    
    // Verificar se o jogador existe
    await this.playersService.getPlayer(playerId);
    
    return this.matchModel
      .find({ players: { $in: [playerId] } })
      .populate('players')
      .populate('def')
      .exec();
  }

  async findByCategory(category: string): Promise<Match[]> {
    // Verificar se a categoria existe
    await this.categoriesService.getCategoryByName(category);
    
    return this.matchModel
      .find({ category })
      .populate('players')
      .populate('def')
      .exec();
  }
}