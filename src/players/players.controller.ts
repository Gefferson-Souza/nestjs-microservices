import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { PlayersService } from './players.service';
import { Player } from './interface/player.interface';
import { UpdatePutPlayerDto } from './dtos/update-put-player.dto';
import { ValidationParametersPipe } from '../common/pipes/validation-parameters/validation-parameters.pipe';
import { PlayerDto } from './dtos/player.dto';

@ApiTags('Players')
@UsePipes(ValidationPipe)
@Controller('api/v1/players')
export class PlayersController {
  constructor(private readonly _playersService: PlayersService) {}

  @Post('')
  @ApiOperation({ summary: 'Create new player' })
  @ApiResponse({
    status: 201,
    type: CreatePlayerDto,
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(@Body() player: CreatePlayerDto): Promise<Player | null> {
    return this._playersService.create(player);
  }

  @Get('')
  @ApiOperation({ summary: 'List all players' })
  @ApiResponse({
    status: 200,
    description: 'List players',
  })
  @ApiResponse({ status: 400, description: 'Error on list players' })
  async list(): Promise<Player[] | []> {
    return this._playersService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get player by id' })
  @ApiResponse({
    status: 200,
    type: PlayerDto,
  })
  @ApiResponse({ status: 400, description: 'Error on get player' })
  @ApiResponse({ status: 404, description: 'Player not found' })
  async getPlayer(
    @Param('id', ValidationParametersPipe) id: string,
  ): Promise<Player | null> {
    return this._playersService.getPlayer(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update player' })
  @ApiResponse({
    status: 200,
    type: PlayerDto,
  })
  @ApiResponse({ status: 400, description: 'Error on update player' })
  @ApiResponse({ status: 404, description: 'Player not found' })
  async update(
    @Body() player: UpdatePutPlayerDto,
    @Param('id') id: string,
  ): Promise<Player | null> {
    return this._playersService.update(id, player);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete player' })
  @ApiResponse({
    status: 200,
    description: 'Player deleted',
    type: PlayerDto,
  })
  @ApiResponse({ status: 400, description: 'Error on delete player' })
  @ApiResponse({ status: 404, description: 'Player not found' })
  async delete(
    @Param('id', ValidationParametersPipe) id: string,
  ): Promise<Player | null> {
    return this._playersService.removePlayer(id);
  }
}
