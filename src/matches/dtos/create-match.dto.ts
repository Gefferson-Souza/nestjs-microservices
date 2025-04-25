import { IsArray, IsNotEmpty, IsString, ValidateNested, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class Result {
  @ApiProperty({ description: 'Resultado do set', example: '6-4' })
  @IsString()
  @IsNotEmpty()
  set: string;
}

export class CreateMatchDto {
  @ApiProperty({ description: 'Categoria da partida', example: 'A' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ 
    description: 'IDs dos jogadores participantes da partida', 
    example: ['5f5a53a98a3dc10f4c7120eb', '5f5a53a98a3dc10f4c7120ec'],
    type: [String]
  })
  @IsArray()
  players: string[];

  @ApiProperty({ description: 'ID do jogador vencedor', example: '5f5a53a98a3dc10f4c7120eb' })
  @IsString()
  @IsNotEmpty()
  def: string;

  @ApiProperty({ 
    description: 'Resultados da partida',
    type: [Result],
    example: [{ set: '6-3' }, { set: '4-6' }, { set: '6-2' }]
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => Result)
  result: Result[];
}