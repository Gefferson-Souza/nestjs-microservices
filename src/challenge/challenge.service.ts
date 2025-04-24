import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Challenge } from './interfaces/challenge.interface';
import { Model } from 'mongoose';

@Injectable()
export class ChallengeService {
    constructor(
        @InjectModel('Challenge')
        private readonly _challengeModel: Model<Challenge>,
    ) { }

    async create(challenge: Challenge): Promise<Challenge> {
        const newChallenge = new this._challengeModel(challenge);
        return newChallenge.save();
    }
}

