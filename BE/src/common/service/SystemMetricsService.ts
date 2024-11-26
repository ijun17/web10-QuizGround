import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * @interface SystemMetrics
 * @description 시스템 메트릭 인터페이스
 */
interface SystemMetrics {
  cpu: number;
  memory: {
    system: {
      total: number; // GB
      used: number; // GB
      free: number; // GB
      usagePercentage: number; // %
    };
    process: {
      heapTotal: number; // MB
      heapUsed: number; // MB
      rss: number; // MB
      external: number; // MB
    };
  };
  mysql: {
    total: number;
    active: number;
    idle: number;
    connected?: number;
    waiting?: number;
  };
  redis: {
    connectedClients: number;
    usedMemoryMB: number;
    clientList: number;
    queueLength: number;
    cmdstat: string;
  };
}

/**
 * @class SystemMetricsService
 * @description 시스템 메트릭 수집 서비스
 */
@Injectable()
export class SystemMetricsService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

  async getMetrics(): Promise<SystemMetrics> {
    const [cpuUsage, memoryUsage] = await Promise.all([this.getCpuUsage(), this.getMemoryUsage()]);

    return {
      cpu: cpuUsage,
      memory: memoryUsage,
      mysql: await this.getMySQLMetrics(),
      redis: await this.getRedisMetrics()
    };
  }

  private async getCpuUsage(): Promise<number> {
    const cpus = require('os').cpus();
    const cpuCount = cpus.length;

    const loadAvg = require('os').loadavg();
    return (loadAvg[0] / cpuCount) * 100;
  }

  private getMemoryUsage() {
    const os = require('os');

    // 시스템 전체 메모리
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    // Node.js 프로세스 메모리
    const processMemory = process.memoryUsage();

    return {
      system: {
        total: Math.round(totalMemory / 1024 / 1024 / 1024), // GB
        used: Math.round(usedMemory / 1024 / 1024 / 1024), // GB
        free: Math.round(freeMemory / 1024 / 1024 / 1024), // GB
        usagePercentage: Math.round((usedMemory / totalMemory) * 100)
      },
      process: {
        heapTotal: Math.round(processMemory.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(processMemory.heapUsed / 1024 / 1024), // MB
        rss: Math.round(processMemory.rss / 1024 / 1024), // MB
        external: Math.round(processMemory.external / 1024 / 1024) // MB
      }
    };
  }

  private async getMySQLMetrics(): Promise<{
    total: number;
    active: number;
    idle: number;
    connected?: number;
    waiting?: number;
  }> {
    try {
      // TypeORM의 connection options에서 직접 가져오기
      const connectionOptions = this.dataSource.options;
      const poolSize = (connectionOptions as any).extra?.connectionLimit || 10; // 기본값

      // 현재 연결 상태
      const queryRunner = this.dataSource.createQueryRunner();
      const result = await queryRunner.query(
        'SHOW STATUS WHERE Variable_name IN ("Threads_connected", "Threads_running", "Threads_cached")'
      );
      await queryRunner.release();

      const metrics = result.reduce((acc, row) => {
        acc[row.Variable_name] = parseInt(row.Value);
        return acc;
      }, {});

      return {
        total: poolSize,
        active: metrics.Threads_running || 0,
        idle: metrics.Threads_cached || 0,
        connected: metrics.Threads_connected || 0
      };
    } catch (error) {
      return {
        total: 0,
        active: 0,
        idle: 0,
        waiting: 0
      };
    }
  }

  private async getRedisMetrics() {
    const info = await this.redis.info();
    const clientList = await this.redis.client('LIST');

    // Redis INFO 명령어 결과 파싱
    const connected_clients = parseInt(info.match(/connected_clients:(\d+)/)?.[1] || '0');
    const used_memory = parseInt(info.match(/used_memory:(\d+)/)?.[1] || '0');

    const { queueLength, cmdstat, totalCommands } = await this.getCommandStats();

    return {
      connectedClients: connected_clients,
      usedMemoryMB: Math.round(used_memory / 1024 / 1024),
      clientList: String(clientList).split('\n').length,
      queueLength,
      cmdstat
    };
  }

  private async getCommandStats() {
    // 현재 처리 중인 명령어 수
    const cmdstat = await this.redis.info('commandstats');

    // 클라이언트 큐 길이
    const queueLength = (this.redis as any).commandQueue?.length || 0;

    // 처리된 총 명령어 수
    const totalCommands = await this.redis.info('stats');

    return {
      queueLength,
      totalCommands,
      cmdstat
    };
  }
}
