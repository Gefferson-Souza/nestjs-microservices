import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChallengeStatus } from '../interfaces/challenge.interface';

export class UpdateChallengeDto {
  @ApiProperty({ 
    description: 'New challenge date and time', 
    example: '2023-05-15T18:00:00Z',
    required: false
  })
  @IsDateString()
  @IsOptional()
  challengeDateTime?: Date;

  @ApiProperty({ 
    description: 'Challenge status', 
    enum: ChallengeStatus,
    example: 'ACEITO',
    required: false
  })
  @IsEnum(ChallengeStatus, { message: 'Invalid status. Use: ACEITO, NEGADO or CANCELADO' })
  @IsOptional()
  status?: ChallengeStatus;
}