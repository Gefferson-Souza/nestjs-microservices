import { ApiProperty } from '@nestjs/swagger';

export class createPlayerDto {
  @ApiProperty({
    description: 'Telefone do jogador',
    example: '123456789',
  })
  readonly phone: string;

  @ApiProperty({
    description: 'Email do jogador',
    example: 'jogador@email.com',
  })
  readonly email: string;

  @ApiProperty({
    description: 'Nome do jogador',
    example: 'João Silva',
  })
  readonly name: string;
}
