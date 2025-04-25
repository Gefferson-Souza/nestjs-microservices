import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Player } from '../../players/interface/player.interface';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Código da categoria', example: 'A' })
  readonly category: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Nome da categoria', example: 'Categoria A' })
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Descrição da categoria', example: 'Categoria para jogadores avançados' })
  readonly description: string;

  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ 
    description: 'Eventos da categoria',
    example: [{ name: 'VITORIA', operation: '+', value: 30 }]
  })
  readonly events: Array<Event>;

  @IsArray()
  @IsOptional()
  @ApiProperty({ 
    description: 'Lista de jogadores da categoria (opcional)',
    required: false,
    type: [String],
    example: []
  })
  readonly players?: Array<Player>;
}
