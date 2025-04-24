import { Controller, Post } from "@nestjs/common";
import { ChallengeService } from "./challenge.service";
import { Challenge } from "./interfaces/challenge.interface";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller('api/v1/challenges')
export class ChallengeController{
    constructor(
        private readonly _challengeService: ChallengeService,
    ) { }

    @Post('')
    @ApiOperation({ summary: 'Create new challenge' })
    @ApiResponse({
        status: 201,
        description: 'Create new challenge',
    })
    async create(challenge: Challenge): Promise<Challenge> {
       return this._challengeService.create(challenge);
    }
}