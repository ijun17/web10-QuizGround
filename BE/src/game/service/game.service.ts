import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { REDIS_KEY } from '../../common/constants/redis-key.constant';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { GameValidator } from '../validations/game.validator';
import SocketEvents from '../../common/constants/socket-events';
import { StartGameDto } from '../dto/start-game.dto';
import { Server } from 'socket.io';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);
  private scoringMap = new Map<string, number>();

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly httpService: HttpService,
    private readonly gameValidator: GameValidator
  ) {}

  async updatePosition(updatePosition: UpdatePositionDto, clientId: string) {
    const { gameId, newPosition } = updatePosition;

    const playerKey = REDIS_KEY.PLAYER(clientId);

    const player = await this.redis.hgetall(playerKey);
    this.gameValidator.validatePlayerInRoom(SocketEvents.UPDATE_POSITION, gameId, player);

    await this.redis.set(`${playerKey}:Changes`, 'Position');
    await this.redis.hmset(playerKey, {
      positionX: newPosition[0].toString(),
      positionY: newPosition[1].toString()
    });

    this.logger.verbose(
      `플레이어 위치 업데이트: ${gameId} - ${clientId} (${player.playerName}) = ${newPosition}`
    );
  }

  async startGame(startGameDto: StartGameDto, clientId: string) {
    const { gameId } = startGameDto;
    const roomKey = `Room:${gameId}`;

    const room = await this.redis.hgetall(roomKey);
    this.gameValidator.validateRoomExists(SocketEvents.START_GAME, room);

    this.gameValidator.validatePlayerIsHost(SocketEvents.START_GAME, room, clientId);

    const getQuizsetURL = `http://localhost:3000/api/quizset/${room.quizSetId}`;

    // REFACTOR: get 대신 Promise를 반환하는 axiosRef를 사용했으나 더 나은 방식이 있는지 확인
    const quizset = await this.httpService.axiosRef({
      url: getQuizsetURL,
      method: 'GET'
    });
    this.gameValidator.validateQuizsetCount(
      SocketEvents.START_GAME,
      parseInt(room.quizSetCount),
      quizset.data.quizList.length
    );

    // Room Quiz 초기화
    const prevQuizList = await this.redis.smembers(REDIS_KEY.ROOM_QUIZ_SET(gameId));
    for (const prevQuiz of prevQuizList) {
      await this.redis.del(REDIS_KEY.ROOM_QUIZ(gameId, prevQuiz));
      await this.redis.del(REDIS_KEY.ROOM_QUIZ_CHOICES(gameId, prevQuiz));
    }
    await this.redis.del(REDIS_KEY.ROOM_QUIZ_SET(gameId));

    const shuffledQuizList = quizset.data.quizList.sort(() => 0.5 - Math.random());
    const selectedQuizList = shuffledQuizList.slice(0, room.quizSetCount);
    await this.redis.sadd(
      REDIS_KEY.ROOM_QUIZ_SET(gameId),
      ...selectedQuizList.map((quiz) => quiz.id)
    );
    for (const quiz of selectedQuizList) {
      await this.redis.hmset(REDIS_KEY.ROOM_QUIZ(gameId, quiz.id), {
        quiz: quiz.quiz,
        answer: quiz.choiceList.find((choice) => choice.isAnswer).order,
        limitTime: quiz.limitTime.toString(),
        choiceCount: quiz.choiceList.length.toString()
      });
      await this.redis.hmset(
        REDIS_KEY.ROOM_QUIZ_CHOICES(gameId, quiz.id),
        quiz.choiceList.reduce(
          (acc, choice) => {
            acc[choice.order] = choice.content;
            return acc;
          },
          {} as Record<number, string>
        )
      );
    }

    // 리더보드 초기화
    const leaderboard = await this.redis.zrange(REDIS_KEY.ROOM_LEADERBOARD(gameId), 0, -1);
    for (const playerId of leaderboard) {
      await this.redis.zadd(REDIS_KEY.ROOM_LEADERBOARD(gameId), 0, playerId);
    }

    await this.redis.set(`${roomKey}:Changes`, 'Start');
    await this.redis.hmset(roomKey, {
      status: 'playing'
    });
    await this.redis.set(REDIS_KEY.ROOM_CURRENT_QUIZ(gameId), '-1:end'); // 0:start, 0:end, 1:start, 1:end
    await this.redis.set(REDIS_KEY.ROOM_TIMER(gameId), 'timer', 'EX', 3);
    this.logger.verbose(`게임 시작: ${gameId}`);
  }

  async subscribeRedisEvent(server: Server) {
    this.redis.config('SET', 'notify-keyspace-events', 'KEhx');

    // TODO: 분리 필요

    const scoringSubscriber = this.redis.duplicate();
    await scoringSubscriber.psubscribe('scoring:*');
    scoringSubscriber.on('pmessage', async (_pattern, channel, message) => {
      const gameId = channel.split(':')[1];

      const completeClientsCount = parseInt(message);
      this.scoringMap[gameId] += completeClientsCount;

      const playersCount = await this.redis.scard(REDIS_KEY.ROOM_PLAYERS(gameId));
      if (this.scoringMap[gameId] === playersCount) {
        // 채점 완료!
        const currentQuiz = await this.redis.get(REDIS_KEY.ROOM_CURRENT_QUIZ(gameId));
        const splitCurrentQuiz = currentQuiz.split(':');

        const quizNum = parseInt(splitCurrentQuiz[0]);
        const quizList = await this.redis.smembers(REDIS_KEY.ROOM_QUIZ_SET(gameId));
        const quiz = await this.redis.hgetall(REDIS_KEY.ROOM_QUIZ(gameId, quizList[quizNum]));

        const leaderboard = await this.redis.zrange(
          REDIS_KEY.ROOM_LEADERBOARD(gameId),
          0,
          -1,
          'WITHSCORES'
        );
        const players = [];
        for (let i = 0; i < leaderboard.length; i += 2) {
          players.push({
            playerId: leaderboard[i],
            score: parseInt(leaderboard[i + 1]),
            isAnswer:
              (await this.redis.hget(REDIS_KEY.PLAYER(leaderboard[i]), 'isAnswerCorrect')) === '1'
          });
        }
        server.to(gameId).emit(SocketEvents.END_QUIZ_TIME, {
          answer: quiz.answer,
          players: players
        });

        await this.redis.set(REDIS_KEY.ROOM_CURRENT_QUIZ(gameId), `${quizNum}:end`); // 현재 퀴즈 상태를 종료 상태로 변경
        await this.redis.set(REDIS_KEY.ROOM_TIMER(gameId), 'timer', 'EX', '10', 'NX'); // 타이머 설정
      }
    });

    const timerSubscriber = this.redis.duplicate();
    await timerSubscriber.psubscribe(`__keyspace@0__:${REDIS_KEY.ROOM_TIMER('*')}`);
    timerSubscriber.on('pmessage', async (_pattern, channel, message) => {
      const key = channel.replace('__keyspace@0__:', '');
      const splitKey = key.split(':');
      if (splitKey.length !== 3) {
        return;
      }
      const gameId = splitKey[1];

      if (message === 'expired') {
        const currentQuiz = await this.redis.get(REDIS_KEY.ROOM_CURRENT_QUIZ(gameId));
        const splitCurrentQuiz = currentQuiz.split(':');
        const quizNum = parseInt(splitCurrentQuiz[0]);
        if (splitCurrentQuiz[1] === 'start') {
          // 채점
          const quizList = await this.redis.smembers(REDIS_KEY.ROOM_QUIZ_SET(gameId));
          const quiz = await this.redis.hgetall(REDIS_KEY.ROOM_QUIZ(gameId, quizList[quizNum]));
          const clients = server.sockets.adapter.rooms.get(gameId);
          const correctPlayers = [];
          for (const clientId of clients) {
            const player = await this.redis.hgetall(REDIS_KEY.PLAYER(clientId));
            // 임시로 4개 선택지의 경우만 선정 (1 2 / 3 4)
            let selectAnswer = 0;
            if (parseFloat(player.positionY) < 0.5) {
              if (parseFloat(player.positionX) < 0.5) {
                selectAnswer = 1;
              } else {
                selectAnswer = 2;
              }
            } else {
              if (parseFloat(player.positionX) < 0.5) {
                selectAnswer = 3;
              } else {
                selectAnswer = 4;
              }
            }
            if (selectAnswer.toString() === quiz.answer) {
              correctPlayers.push(clientId);
              await this.redis.hmset(REDIS_KEY.PLAYER(clientId), { isAnswerCorrect: '1' });
            } else {
              await this.redis.hmset(REDIS_KEY.PLAYER(clientId), { isAnswerCorrect: '0' });
            }
          }
          for (const clientId of correctPlayers) {
            await this.redis.zincrby(
              REDIS_KEY.ROOM_LEADERBOARD(gameId),
              1000 / correctPlayers.length,
              clientId
            );
          }
          await this.redis.publish(`scoring:${gameId}`, clients.size.toString());
        } else {
          // startQuizTime 하는 부분
          const newQuizNum = quizNum + 1;
          const quizList = await this.redis.smembers(REDIS_KEY.ROOM_QUIZ_SET(gameId));
          if (quizList.length <= newQuizNum) {
            // 마지막 퀴즈이면, 게임 종료!
            // 1등을 새로운 호스트로 설정
            const leaderboard = await this.redis.zrange(
              REDIS_KEY.ROOM_LEADERBOARD(gameId),
              0,
              -1,
              'WITHSCORES'
            );
            // const players = [];
            // for (let i = 0; i < leaderboard.length; i += 2) {
            //   players.push({
            //     playerId: leaderboard[i],
            //     score: parseInt(leaderboard[i + 1])
            //   });
            // }
            server.to(gameId).emit(SocketEvents.END_GAME, {
              host: leaderboard[0] // 아마 첫 번째가 1등..?
            });
            return;
          }
          const quiz = await this.redis.hgetall(REDIS_KEY.ROOM_QUIZ(gameId, quizList[newQuizNum]));
          const quizChoices = await this.redis.hgetall(
            REDIS_KEY.ROOM_QUIZ_CHOICES(gameId, quizList[newQuizNum])
          );
          server.to(gameId).emit(SocketEvents.START_QUIZ_TIME, {
            quiz: quiz.quiz,
            choiceList: Object.entries(quizChoices).map(([key, value]) => ({
              order: key,
              content: value
            })),
            startTime: Date.now() + 3000,
            endTime: Date.now() + (parseInt(quiz.limitTime) + 3) * 1000
          });
          await this.redis.set(REDIS_KEY.ROOM_CURRENT_QUIZ(gameId), `${newQuizNum}:start`); // 현재 퀴즈 상태를 시작 상태로 변경
          await this.redis.set(
            REDIS_KEY.ROOM_TIMER(gameId),
            'timer',
            'EX',
            (parseInt(quiz.limitTime) + 3).toString(),
            'NX'
          ); // 타이머 설정
        }
      }
    });

    const roomSubscriber = this.redis.duplicate();
    await roomSubscriber.psubscribe('__keyspace@0__:Room:*');
    roomSubscriber.on('pmessage', async (_pattern, channel, message) => {
      const key = channel.replace('__keyspace@0__:', '');
      const splitKey = key.split(':');
      if (splitKey.length !== 2) {
        return;
      }
      const gameId = splitKey[1];

      if (message === 'hset') {
        const changes = await this.redis.get(`${key}:Changes`);
        const roomData = await this.redis.hgetall(key);

        if (changes === 'Option') {
          server.to(gameId).emit(SocketEvents.UPDATE_ROOM_OPTION, {
            title: roomData.title,
            gameMode: roomData.gameMode,
            maxPlayerCount: roomData.maxPlayerCount,
            isPublic: roomData.isPublic
          });
        } else if (changes === 'Quizset') {
          server.to(gameId).emit(SocketEvents.UPDATE_ROOM_QUIZSET, {
            quizSetId: roomData.quizSetId,
            quizCount: roomData.quizCount
          });
        } else if (changes === 'Start') {
          server.to(gameId).emit(SocketEvents.START_GAME, '');
        }
      }
    });

    const playerSubscriber = this.redis.duplicate();
    playerSubscriber.psubscribe('__keyspace@0__:Player:*');
    playerSubscriber.on('pmessage', async (_pattern, channel, message) => {
      const key = channel.replace('__keyspace@0__:', '');
      const splitKey = key.split(':');
      if (splitKey.length !== 2) {
        return;
      }
      const playerId = splitKey[1];

      if (message === 'hset') {
        const changes = await this.redis.get(`${key}:Changes`);
        const playerData = await this.redis.hgetall(key);
        if (changes === 'Join') {
          const newPlayer = {
            playerId: playerId,
            playerName: playerData.playerName,
            playerPosition: [parseFloat(playerData.positionX), parseFloat(playerData.positionY)]
          };
          server.to(playerData.gameId).emit(SocketEvents.JOIN_ROOM, {
            players: [newPlayer]
          });
        } else if (changes === 'Position') {
          server.to(playerData.gameId).emit(SocketEvents.UPDATE_POSITION, {
            playerId: playerId,
            playerPosition: [parseFloat(playerData.positionX), parseFloat(playerData.positionY)]
          });
        } else if (changes === 'Disconnect') {
          server.to(playerData.gameId).emit(SocketEvents.EXIT_ROOM, {
            playerId: playerId
          });
        }
      }
    });
  }

  async disconnect(clientId: string) {
    const playerKey = REDIS_KEY.PLAYER(clientId);
    const playerData = await this.redis.hgetall(playerKey);

    const roomPlayersKey = REDIS_KEY.ROOM_PLAYERS(playerData.gameId);
    await this.redis.srem(roomPlayersKey, clientId);

    const roomLeaderboardKey = REDIS_KEY.ROOM_LEADERBOARD(playerData.gameId);
    await this.redis.zrem(roomLeaderboardKey, clientId);

    const roomKey = REDIS_KEY.ROOM(playerData.gameId);
    const host = await this.redis.hget(roomKey, 'host');
    const players = await this.redis.smembers(roomPlayersKey);
    if (host === clientId && players.length > 0) {
      const newHost = await this.redis.srandmember(REDIS_KEY.ROOM_PLAYERS(playerData.gameId));
      await this.redis.hmset(roomKey, {
        host: newHost
      });
    }
    await this.redis.set(`${playerKey}:Changes`, 'Disconnect');
    await this.redis.hmset(playerKey, {
      disconnected: '1'
    });

    if (players.length === 0) {
      await this.redis.del(roomKey);
      await this.redis.del(roomPlayersKey);
      await this.redis.del(roomLeaderboardKey);
    }
  }
}
