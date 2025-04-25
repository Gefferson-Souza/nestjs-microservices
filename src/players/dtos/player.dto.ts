import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsMongoId,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class PlayerDto {
  @ApiProperty({
    description: 'ID do jogador',
    example: '1234567890abcdef12345678',
  })
  @IsMongoId()
  readonly _id: string;

  @ApiProperty({
    description: 'Telefone do jogador',
    example: '123456789',
  })
  @IsString()
  readonly phone: string;

  @ApiProperty({
    description: 'Email do jogador',
    example: 'test@gmail.com',
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: 'Nome do jogador',
    example: 'João Silva',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Ranking do jogador',
    example: 'A',
  })
  @IsString()
  @MaxLength(1)
  ranking: string;

  @ApiProperty({
    description: 'Posição do jogador no ranking',
    example: 1,
  })
  @IsNumber()
  rankingPosition: number;

  @ApiProperty({
    description: 'Avatar do jogador',
    example: 'https://example.com/avatar.jpg',
  })
  @IsString()
  avatar: string;
}
