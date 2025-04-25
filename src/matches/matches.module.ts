import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchSchema } from './interfaces/match.schema';
import { PlayersModule } from '../players/players.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Match', schema: MatchSchema }
    ]),
    PlayersModule,
    CategoriesModule
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService], // Exportando o serviço para ser usado em outros módulos
})
export class MatchesModule {}