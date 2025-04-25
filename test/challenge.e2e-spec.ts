import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ChallengeStatus } from '../src/challenge/interfaces/challenge.interface';

describe('Challenge (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  
  // IDs para uso nos testes
  let playerId1: string;
  let playerId2: string;
  let categoryId: string;
  let challengeId: string;
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    // Pegar conexão do Mongoose
    connection = moduleFixture.get<Connection>(getConnectionToken());
    
    await app.init();
    
    // Criar jogadores para os testes
    const player1 = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name: 'Jogador Teste 1',
        email: 'jogador1@teste.com',
        phone: '123456789'
      });
    
    const player2 = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name: 'Jogador Teste 2',
        email: 'jogador2@teste.com',
        phone: '987654321'
      });
    
    playerId1 = player1.body._id;
    playerId2 = player2.body._id;
    
    // Criar categoria para os testes
    const category = await request(app.getHttpServer())
      .post('/api/v1/categories')
      .send({
        category: 'E2E',
        name: 'Categoria E2E',
        description: 'Categoria para testes e2e',
        events: [
          {
            name: 'VITORIA',
            operation: '+',
            value: 30
          },
          {
            name: 'DERROTA',
            operation: '+',
            value: 0
          }
        ]
      });
    
    categoryId = category.body._id;
    
    // Associar jogadores à categoria
    await request(app.getHttpServer())
      .post(`/api/v1/categories/${categoryId}/players/${playerId1}`)
      .send();
    
    await request(app.getHttpServer())
      .post(`/api/v1/categories/${categoryId}/players/${playerId2}`)
      .send();
  });

  afterAll(async () => {
    // Limpeza do banco de dados após os testes
    const collections = connection.collections;
    
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    
    await app.close();
  });

  it('should create a challenge', async () => {
    const challengeDate = new Date();
    challengeDate.setDate(challengeDate.getDate() + 5); // 5 dias à frente
    
    const response = await request(app.getHttpServer())
      .post('/api/v1/challenges')
      .send({
        challengeDateTime: challengeDate.toISOString(),
        requester: playerId1,
        players: [playerId1, playerId2]
      })
      .expect(201);
    
    challengeId = response.body._id;
    
    expect(response.body).toHaveProperty('status', ChallengeStatus.PENDING);
    expect(response.body).toHaveProperty('requester', playerId1);
    expect(response.body.players).toContain(playerId1);
    expect(response.body.players).toContain(playerId2);
  });

  it('should retrieve all challenges', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/challenges')
      .expect(200);
    
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should retrieve challenges by player id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/challenges?playerId=${playerId1}`)
      .expect(200);
    
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    
    // Verificar se todos os desafios contêm o jogador
    response.body.forEach(challenge => {
      expect(challenge.players).toEqual(
        expect.arrayContaining([expect.objectContaining({ _id: playerId1 })])
      );
    });
  });

  it('should retrieve a challenge by id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/challenges/${challengeId}`)
      .expect(200);
    
    expect(response.body).toHaveProperty('_id', challengeId);
  });

  it('should update a challenge status', async () => {
    const response = await request(app.getHttpServer())
      .put(`/api/v1/challenges/${challengeId}`)
      .send({
        status: ChallengeStatus.ACCEPTED
      })
      .expect(200);
    
    // Verificar se o status foi alterado
    const updatedChallenge = await request(app.getHttpServer())
      .get(`/api/v1/challenges/${challengeId}`)
      .expect(200);
    
    expect(updatedChallenge.body).toHaveProperty('status', ChallengeStatus.ACCEPTED);
  });

  it('should assign a match to a challenge', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/challenges/${challengeId}/match`)
      .send({
        def: playerId1,
        result: [
          { set: '6-3' },
          { set: '4-6' },
          { set: '6-2' }
        ]
      })
      .expect(201);  // Ajustando para esperar 201 em vez de 200
    
    // Verificar se o status foi alterado para REALIZADO
    const updatedChallenge = await request(app.getHttpServer())
      .get(`/api/v1/challenges/${challengeId}`)
      .expect(200);
    
    expect(updatedChallenge.body).toHaveProperty('status', ChallengeStatus.REALIZED);
    expect(updatedChallenge.body).toHaveProperty('match');
  }, 15000);  // Aumentando o timeout para 15 segundos

  it('should not create a challenge if requester is not in players list', async () => {
    const challengeDate = new Date();
    challengeDate.setDate(challengeDate.getDate() + 5);
    
    await request(app.getHttpServer())
      .post('/api/v1/challenges')
      .send({
        challengeDateTime: challengeDate.toISOString(),
        requester: 'invalidPlayerId',
        players: [playerId1, playerId2]
      })
      .expect(400);
  });

  it('should not update to invalid status', async () => {
    // Criar um novo desafio para teste
    const challengeDate = new Date();
    challengeDate.setDate(challengeDate.getDate() + 7);
    
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/challenges')
      .send({
        challengeDateTime: challengeDate.toISOString(),
        requester: playerId1,
        players: [playerId1, playerId2]
      })
      .expect(201);
    
    const newChallengeId = createResponse.body._id;
    
    // Tentar atualizar com status inválido
    await request(app.getHttpServer())
      .put(`/api/v1/challenges/${newChallengeId}`)
      .send({
        status: ChallengeStatus.PENDING  // PENDING não é um status válido para atualização
      })
      .expect(400);
  });

  it('should cancel (delete) a challenge', async () => {
    // Criar um novo desafio para teste
    const challengeDate = new Date();
    challengeDate.setDate(challengeDate.getDate() + 10);
    
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/challenges')
      .send({
        challengeDateTime: challengeDate.toISOString(),
        requester: playerId1,
        players: [playerId1, playerId2]
      })
      .expect(201);
    
    const newChallengeId = createResponse.body._id;
    
    // Cancelar o desafio
    await request(app.getHttpServer())
      .delete(`/api/v1/challenges/${newChallengeId}`)
      .expect(200);
    
    // Verificar se o status foi alterado para CANCELADO
    const updatedChallenge = await request(app.getHttpServer())
      .get(`/api/v1/challenges/${newChallengeId}`)
      .expect(200);
    
    expect(updatedChallenge.body).toHaveProperty('status', ChallengeStatus.CANCELED);
  });
});