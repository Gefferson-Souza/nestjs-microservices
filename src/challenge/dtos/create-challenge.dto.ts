import { IsArray, IsDateString, IsNotEmpty, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChallengeDto {
  @ApiProperty({ description: 'Challenge date and time', example: '2023-05-10T18:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  challengeDateTime: Date;

  @ApiProperty({ description: 'Player who is requesting the challenge (ID)', example: '5f5a53a98a3dc10f4c7120eb' })
  @IsNotEmpty()
  requester: string;

  @ApiProperty({ 
    description: 'Players participating in the challenge (must include the requester)',
    example: ['5f5a53a98a3dc10f4c7120eb', '5f5a53a98a3dc10f4c7120ec'],
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNotEmpty()
  players: string[];
}