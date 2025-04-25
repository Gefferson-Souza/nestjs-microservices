import { IsArray, IsNotEmpty, IsString, ValidateNested, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class Result {
  @ApiProperty({ description: 'Set result', example: '6-4' })
  @IsString()
  @IsNotEmpty()
  set: string;
}

export class AssignMatchToChallengeDto {
  @ApiProperty({ description: 'Winner player ID', example: '5f5a53a98a3dc10f4c7120eb' })
  @IsNotEmpty()
  def: string;

  @ApiProperty({ 
    description: 'Match results',
    type: [Result],
    example: [{ set: '6-3' }, { set: '4-6' }, { set: '6-2' }]
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => Result)
  result: Result[];
}