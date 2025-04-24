import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Player } from '../../players/interface/player.interface';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  readonly category: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsArray()
  @ArrayMinSize(1)
  readonly events: Array<Event>;

  @ArrayMinSize(1)
  readonly players: Array<Player>;
}
