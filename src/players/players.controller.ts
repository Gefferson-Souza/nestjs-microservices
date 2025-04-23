import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { createPlayerDto } from './dtos/create-player.dto';
import PlayeSchema  from './interface/player.schema';
import { PlayersService } from './players.service';
import { Player } from './interface/player.interface';

@ApiTags('Players')
@Controller('api/v1/players')
export class PlayersController {

  constructor(
    private readonly _playersService: PlayersService,
  ){}

  @Post('')
  @ApiOperation({ summary: 'Criar um novo jogador' })
  @ApiResponse({
    status: 201,
    type: createPlayerDto,
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(
    @Body() player: createPlayerDto,
  ): Promise<Partial<createPlayerDto>> {
    return this._playersService.create(player);
  }

  @Get('')
  @ApiOperation({ summary: 'Listar todos os jogadores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de jogadores',
  })
  @ApiResponse({ status: 400, description: 'Erro ao listar jogadores' })
  async list(): Promise<Player[]> {
      return this._playersService.list();
  }
}
