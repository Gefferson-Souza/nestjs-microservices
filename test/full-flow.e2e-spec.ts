import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ChallengeStatus } from '../src/challenge/interfaces/challenge.interface';

describe('Fluxo Completo da Aplicação (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  
  // IDs para uso nos testes
  let player1Id: string;
  let player2Id: string;
  let categoryId: string;
  let challengeId: string;
  let matchId: string;

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
  });

  afterAll(async () => {
    // Limpeza do banco de dados após os testes
    const collections = connection.collections;
    
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    
    await app.close();
  });

  describe('1. Módulo de Players', () => {
    it('1.1 Deve criar o primeiro jogador', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/players')
        .send({
          name: 'Jogador Teste 1',
          email: 'jogador1@teste.com',
          phone: '123456789'
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', 'Jogador Teste 1');
      expect(response.body).toHaveProperty('email', 'jogador1@teste.com');
      
      player1Id = response.body._id;
    });

    it('1.2 Deve criar o segundo jogador', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/players')
        .send({
          name: 'Jogador Teste 2',
          email: 'jogador2@teste.com',
          phone: '987654321'
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', 'Jogador Teste 2');
      expect(response.body).toHaveProperty('email', 'jogador2@teste.com');
      
      player2Id = response.body._id;
    });

    it('1.3 Deve listar todos os jogadores', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/players')
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      expect(response.body.some(player => player._id === player1Id)).toBe(true);
      expect(response.body.some(player => player._id === player2Id)).toBe(true);
    });

    it('1.4 Deve buscar um jogador pelo ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/players/${player1Id}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('_id', player1Id);
      expect(response.body).toHaveProperty('name', 'Jogador Teste 1');
    });

    it('1.5 Deve atualizar um jogador', async () => {
      const updatedName = 'Jogador 1 Atualizado';
      const response = await request(app.getHttpServer())
        .put(`/api/v1/players/${player1Id}`)
        .send({
          name: updatedName,
          email: 'jogador1@teste.com',
          phone: '123456789'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('name', updatedName);
      
      // Verificar se a atualização foi persistida
      const getResponse = await request(app.getHttpServer())
        .get(`/api/v1/players/${player1Id}`)
        .expect(200);
      
      expect(getResponse.body).toHaveProperty('name', updatedName);
    });
  });

  describe('2. Módulo de Categories', () => {
    it('2.1 Deve criar uma categoria', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({
          category: 'A',
          name: 'Categoria A',
          description: 'Categoria para jogadores avançados',
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
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('category', 'A');
      expect(response.body).toHaveProperty('name', 'Categoria A');
      expect(response.body.events).toHaveLength(2);
      
      categoryId = response.body._id;
    });

    it('2.2 Deve listar todas as categorias', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/categories')
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.some(cat => cat._id === categoryId)).toBe(true);
    });

    it('2.3 Deve buscar uma categoria pelo ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/categories/${categoryId}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('_id', categoryId);
      expect(response.body).toHaveProperty('category', 'A');
    });

    it('2.4 Deve adicionar o primeiro jogador à categoria', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/categories/${categoryId}/players/${player1Id}`)
        .expect(200);
      
      // Verificar se o jogador foi adicionado à categoria
      const response = await request(app.getHttpServer())
        .get(`/api/v1/categories/${categoryId}`)
        .expect(200);
      
      expect(response.body.players).toContain(player1Id);
    });

    it('2.5 Deve adicionar o segundo jogador à categoria', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/categories/${categoryId}/players/${player2Id}`)
        .expect(200);
      
      // Verificar se o jogador foi adicionado à categoria
      const response = await request(app.getHttpServer())
        .get(`/api/v1/categories/${categoryId}`)
        .expect(200);
      
      expect(response.body.players).toContain(player1Id);
      expect(response.body.players).toContain(player2Id);
    });
  });

  describe('3. Módulo de Challenges', () => {
    it('3.1 Deve criar um desafio entre os jogadores', async () => {
      const challengeDate = new Date();
      challengeDate.setDate(challengeDate.getDate() + 5); // 5 dias à frente
      
      const response = await request(app.getHttpServer())
        .post('/api/v1/challenges')
        .send({
          challengeDateTime: challengeDate.toISOString(),
          requester: player1Id,
          players: [player1Id, player2Id]
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('status', ChallengeStatus.PENDING);
      expect(response.body).toHaveProperty('requester', player1Id);
      expect(response.body.players).toContain(player1Id);
      expect(response.body.players).toContain(player2Id);
      
      challengeId = response.body._id;
    });

    it('3.2 Deve listar todos os desafios', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/challenges')
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.some(challenge => challenge._id === challengeId)).toBe(true);
    });

    it('3.3 Deve buscar um desafio pelo ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/challenges/${challengeId}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('_id', challengeId);
      expect(response.body).toHaveProperty('status', ChallengeStatus.PENDING);
    });

    it('3.4 Deve buscar desafios por jogador', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/challenges?playerId=${player1Id}`)
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].players).toEqual(
        expect.arrayContaining([expect.objectContaining({ _id: player1Id })])
      );
    });

    it('3.5 Deve aceitar o desafio', async () => {
      await request(app.getHttpServer())
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
  });

  describe('4. Módulo de Matches', () => {
    it('4.1 Deve atribuir uma partida ao desafio', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/challenges/${challengeId}/match`)
        .send({
          def: player1Id,
          result: [
            { set: '6-4' },
            { set: '3-6' },
            { set: '6-3' }
          ]
        })
        .expect(201);
      
      // Verificar se o status do desafio foi alterado para REALIZADO
      const updatedChallenge = await request(app.getHttpServer())
        .get(`/api/v1/challenges/${challengeId}`)
        .expect(200);
      
      expect(updatedChallenge.body).toHaveProperty('status', ChallengeStatus.REALIZED);
      expect(updatedChallenge.body).toHaveProperty('match');
      
      matchId = updatedChallenge.body.match;
    });

    it('4.2 Deve listar todas as partidas', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/matches')
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('4.3 Deve buscar partidas por ID', async () => {
      // Como o matchId foi extraído do desafio, vamos verificar se conseguimos encontrá-lo
      const response = await request(app.getHttpServer())
        .get(`/api/v1/matches/${matchId}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('_id', matchId);
      expect(response.body).toHaveProperty('def');
      expect(response.body.result).toHaveLength(3);
    });

    it('4.4 Deve buscar partidas por jogador', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/matches?playerId=${player1Id}`)
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('4.5 Deve buscar partidas por categoria', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/matches?category=A`)
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('5. Fluxo de integração completo', () => {
    it('5.1 Deve criar outro jogador, adicioná-lo à categoria e criar um desafio', async () => {
      // Criar jogador 3
      const playerResponse = await request(app.getHttpServer())
        .post('/api/v1/players')
        .send({
          name: 'Jogador Teste 3',
          email: 'jogador3@teste.com',
          phone: '555555555'
        })
        .expect(201);
      
      const player3Id = playerResponse.body._id;

      // Adicionar à categoria
      await request(app.getHttpServer())
        .post(`/api/v1/categories/${categoryId}/players/${player3Id}`)
        .expect(200);
      
      // Criar desafio entre jogador 2 e jogador 3
      const challengeDate = new Date();
      challengeDate.setDate(challengeDate.getDate() + 7); // 7 dias à frente
      
      const challengeResponse = await request(app.getHttpServer())
        .post('/api/v1/challenges')
        .send({
          challengeDateTime: challengeDate.toISOString(),
          requester: player2Id,
          players: [player2Id, player3Id]
        })
        .expect(201);
      
      const newChallengeId = challengeResponse.body._id;

      // Aceitar o desafio
      await request(app.getHttpServer())
        .put(`/api/v1/challenges/${newChallengeId}`)
        .send({
          status: ChallengeStatus.ACCEPTED
        })
        .expect(200);
      
      // Registrar partida
      await request(app.getHttpServer())
        .post(`/api/v1/challenges/${newChallengeId}/match`)
        .send({
          def: player3Id,
          result: [
            { set: '6-2' },
            { set: '6-1' }
          ]
        })
        .expect(201);

      // Verificar existência da partida nos desafios
      const challengesResponse = await request(app.getHttpServer())
        .get('/api/v1/challenges')
        .expect(200);
      
      expect(challengesResponse.body.length).toBeGreaterThanOrEqual(2);
      
      // Verificar se temos pelo menos 2 partidas registradas
      const matchesResponse = await request(app.getHttpServer())
        .get('/api/v1/matches')
        .expect(200);
      
      expect(matchesResponse.body.length).toBeGreaterThanOrEqual(2);
    });

    it('5.2 Deve verificar consistência entre desafios, partidas e jogadores', async () => {
      // Buscar todos os desafios
      const challengesResponse = await request(app.getHttpServer())
        .get('/api/v1/challenges')
        .expect(200);
      
      const challenges = challengesResponse.body;
      
      // Verificar cada desafio com status "REALIZADO"
      for (const challenge of challenges.filter(c => c.status === ChallengeStatus.REALIZED)) {
        // Verificar se o desafio tem uma referência de partida
        expect(challenge).toHaveProperty('match');
        
        // Buscar a partida referenciada
        const matchResponse = await request(app.getHttpServer())
          .get(`/api/v1/matches/${challenge.match}`)
          .expect(200);
        
        const match = matchResponse.body;
        
        // Verificar se o jogador vencedor está na lista de jogadores do desafio
        const playerIds = challenge.players.map(p => p._id);
        expect(playerIds).toContain(match.def);
        
        // Verificar se a categoria da partida é a mesma do desafio
        expect(match).toHaveProperty('category', challenge.category);
      }
    });
  });
});