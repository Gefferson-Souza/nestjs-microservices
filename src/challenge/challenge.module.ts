import { Module } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { ChallengeSchema } from './interfaces/challenge.schema';
import { ChallengeController } from './challenge.controller';

@Module({
  controllers: [ChallengeController],
  providers: [ChallengeService],
  imports:[
    MongooseModule.forFeature([{ name: 'Challenge', schema: ChallengeSchema }]),
  ]
})
export class ChallengeModule {}
