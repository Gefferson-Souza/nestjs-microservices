import { Body, Controller, Get, Param, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dtos/create-match.dto';
import { Match } from './interfaces/match.interface';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('matches')
@Controller('api/v1/matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova partida' })
  @ApiResponse({ 
    status: 201, 
    description: 'Partida criada com sucesso'
  })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  @UsePipes(ValidationPipe)
  async createMatch(@Body() createMatchDto: CreateMatchDto): Promise<Match> {
    return this.matchesService.createMatch(createMatchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as partidas' })
  @ApiQuery({ name: 'playerId', required: false, description: 'ID do jogador para filtrar partidas' })
  @ApiQuery({ name: 'category', required: false, description: 'Categoria para filtrar partidas' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de partidas retornada com sucesso'
  })
  async findAll(
    @Query('playerId') playerId: string,
    @Query('category') category: string
  ): Promise<Match[]> {
    if (playerId) {
      return this.matchesService.findByPlayerId(playerId);
    } else if (category) {
      return this.matchesService.findByCategory(category);
    } else {
      return this.matchesService.findAll();
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma partida pelo ID' })
  @ApiParam({ name: 'id', description: 'ID da partida' })
  @ApiResponse({ status: 200, description: 'Partida encontrada com sucesso' })
  @ApiResponse({ status: 404, description: 'Partida não encontrada' })
  async findById(@Param('id') id: string): Promise<Match> {
    return this.matchesService.findById(id);
  }
}