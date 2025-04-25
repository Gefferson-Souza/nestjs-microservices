import { Module } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChallengeSchema } from './interfaces/challenge.schema';
import { ChallengeController } from './challenge.controller';
import { PlayersModule } from '../players/players.module';
import { CategoriesModule } from '../categories/categories.module';
import { MatchesModule } from '../matches/matches.module';

@Module({
  controllers: [ChallengeController],
  providers: [ChallengeService],
  imports: [
    MongooseModule.forFeature([
      { name: 'Challenge', schema: ChallengeSchema }
    ]),
    PlayersModule,
    CategoriesModule,
    MatchesModule
  ],
})
export class ChallengeModule {}
