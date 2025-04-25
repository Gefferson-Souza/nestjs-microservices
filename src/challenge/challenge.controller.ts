import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { Challenge } from './interfaces/challenge.interface';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { AssignMatchToChallengeDto } from './dtos/assign-match-to-challenge.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Match } from '../matches/interfaces/match.interface';

@ApiTags('challenges')
@Controller('api/v1/challenges')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo desafio' })
  @ApiResponse({ 
    status: 201, 
    description: 'Desafio criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        // Defina as propriedades do objeto Challenge aqui
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  @UsePipes(ValidationPipe)
  async createChallenge(@Body() createChallengeDto: CreateChallengeDto): Promise<Challenge> {
    return this.challengeService.create(createChallengeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os desafios' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de desafios retornada com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          // Defina as propriedades do objeto Challenge aqui
        }
      }
    }
  })
  async findAll(@Query('playerId') playerId: string): Promise<Challenge[]> {
    if (playerId) {
      return this.challengeService.findChallengesByPlayer(playerId);
    } else {
      return this.challengeService.findAll();
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um desafio pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do desafio' })
  @ApiResponse({ status: 200, description: 'Desafio encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Desafio não encontrado' })
  async findOne(@Param('id') id: string): Promise<Challenge> {
    return this.challengeService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um desafio' })
  @ApiParam({ name: 'id', description: 'ID do desafio' })
  @ApiBody({ type: UpdateChallengeDto })
  @ApiResponse({ status: 200, description: 'Desafio atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Desafio não encontrado' })
  @UsePipes(ValidationPipe)
  async update(
    @Param('id') id: string,
    @Body() updateChallengeDto: UpdateChallengeDto,
  ): Promise<void> {
    await this.challengeService.update(id, updateChallengeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar um desafio' })
  @ApiParam({ name: 'id', description: 'ID do desafio' })
  @ApiResponse({ status: 200, description: 'Desafio deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Desafio não encontrado' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.challengeService.delete(id);
  }

  @Post(':id/match')
  @ApiOperation({ summary: 'Atribuir uma partida a um desafio' })
  @ApiParam({ name: 'id', description: 'ID do desafio' })
  @ApiBody({ type: AssignMatchToChallengeDto })
  @ApiResponse({ status: 201, description: 'Partida atribuída com sucesso' })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  @ApiResponse({ status: 404, description: 'Desafio não encontrado' })
  @UsePipes(ValidationPipe)
  async assignMatch(
    @Param('id') id: string,
    @Body() assignMatchDto: AssignMatchToChallengeDto,
  ): Promise<Match> {
    return await this.challengeService.assignMatchToChallenge(id, assignMatchDto);
  }
}
