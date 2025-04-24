import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreatePlayerDto {
  @ApiProperty({
    description: 'Telefone do jogador',
    example: '123456789',
  })
  @IsNotEmpty()
  readonly phone: string;

  @ApiProperty({
    description: 'Email do jogador',
    example: 'jogador@email.com',
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: 'Nome do jogador',
    example: 'João Silva',
  })
  @IsNotEmpty()
  readonly name: string;
}
