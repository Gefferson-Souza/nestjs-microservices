import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty } from "class-validator";
import { CreatePlayerDto } from "./create-player.dto";
import mongoose from "mongoose";

export class UpdatePutPlayerDto extends CreatePlayerDto {
  @ApiProperty({
    description: 'ID do jogador',
    example: mongoose.Types.ObjectId.toString(),
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsMongoId()
  readonly _id: string;
}