import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { createPlayerDto } from './dtos/create-player.dto';

@ApiTags('Players')
@Controller('api/v1/players')
export class PlayersController {
  @Post('')
  @ApiOperation({ summary: 'Criar um novo jogador' })
  @ApiResponse({
    status: 201,
    description: 'Jogador criado com sucesso',
    type: createPlayerDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(
    @Body() player: createPlayerDto,
  ): Promise<Partial<createPlayerDto>> {
    return { email: player.email };
  }
}
