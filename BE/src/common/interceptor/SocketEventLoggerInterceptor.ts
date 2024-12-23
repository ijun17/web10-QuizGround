import { firstValueFrom, Observable } from 'rxjs';
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AsyncLocalStorage } from 'async_hooks';
import { SystemMetricsService } from '../service/SystemMetricsService'; // 이 부분 추가

/**
 * @class TraceStore
 * @description 함수 호출 추적을 위한 저장소
 */
export class TraceStore {
  private static instance = new AsyncLocalStorage<TraceContext>();

  static getStore() {
    return this.instance;
  }
}

/**
 * @class TraceContext
 * @description 추적 컨텍스트
 */
class TraceContext {
  private depth = 0;
  private logs: string[] = [];

  increaseDepth() {
    this.depth++;
  }

  decreaseDepth() {
    this.depth--;
  }

  addLog(message: string) {
    const indent = '  '.repeat(this.depth);
    this.logs.push(`${indent}${message}`);
  }

  getLogs(): string[] {
    return this.logs;
  }
}

// 전역 AsyncLocalStorage 인스턴스
// export const traceStore = new AsyncLocalStorage<TraceContext>();

/**
 * @class SocketEventLoggerInterceptor
 * @description WebSocket 이벤트와 서비스 호출을 로깅하는 인터셉터
 */
@Injectable()
export class SocketEventLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('SocketEventLogger');
  private readonly EXECUTION_TIME_THRESHOLD = 1000;

  constructor(private readonly systemMetricsService: SystemMetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'ws') {
      return next.handle();
    }

    const startedAt = process.hrtime();
    const ctx = context.switchToWs();
    const client: Socket = ctx.getClient();
    const event = ctx.getData();
    const className = context.getClass().name;
    const methodName = context.getHandler().name;

    // 새로운 추적 컨텍스트 시작
    const traceContext = new TraceContext();

    return new Observable((subscriber) => {
      TraceStore.getStore().run(traceContext, async () => {
        try {
          traceContext.addLog(`[${className}.${methodName}] Started`);
          const result = await firstValueFrom(next.handle());
          const endedAt = process.hrtime(startedAt);
          const delta = endedAt[0] * 1e9 + endedAt[1];
          const executionTime = delta / 1e6;

          const logs = traceContext.getLogs();

          // 시스템 메트릭 수집
          const metrics = await this.systemMetricsService.getMetrics();

          this.logger.log(`${methodName} - ${executionTime}ms`);

          // if (executionTime >= this.EXECUTION_TIME_THRESHOLD) {
          //   this.logger.warn(
          //     '\n=============================\n' +
          //       '🐢 Slow Socket Event Detected!\n' +
          //       logs.join('\n') +
          //       `\nTotal Execution Time: ${executionTime}ms\n` +
          //       '\nSystem Metrics:\n' +
          //       `CPU Usage: ${metrics.cpu.toFixed(2)}%\n` +
          //       '\nMemory Usage:\n' +
          //       `System Total: ${metrics.memory.system.total}GB\n` +
          //       `System Used: ${metrics.memory.system.used}GB (${metrics.memory.system.usagePercentage}%)\n` +
          //       `System Free: ${metrics.memory.system.free}GB\n` +
          //       `Process Heap: ${metrics.memory.process.heapUsed}MB / ${metrics.memory.process.heapTotal}MB\n` +
          //       `Process RSS: ${metrics.memory.process.rss}MB\n` +
          //       '\nMySQL Connections:\n' +
          //       `Total: ${metrics.mysql.total}, ` +
          //       `Active: ${metrics.mysql.active}, ` +
          //       `Idle: ${metrics.mysql.idle}, ` +
          //       `Waiting: ${metrics.mysql.waiting}\n` +
          //       '\nRedis Connections:\n' +
          //       `Connected Clients: ${metrics.redis.connectedClients}, ` +
          //       `Used Memory: ${metrics.redis.usedMemoryMB}MB\n` +
          //       // `클라이언트 큐 길이: ${metrics.redis.queueLength}\n` +
          //       // `현재 처리중인 명령어 수 : ${metrics.redis.cmdstat}\n` +
          //       '============================='
          //   );
          // } else {
          //   this.logger.log(
          //     '\n=============================\n' +
          //       '🚀 Socket Event Processed\n' +
          //       logs.join('\n') +
          //       `\nTotal Execution Time: ${executionTime}ms\n` +
          //       '============================='
          //     // 정상 처리시에는 간단한 로그만
          //   );
          // }

          subscriber.next(result);
          subscriber.complete();
        } catch (error) {
          const logs = traceContext.getLogs();
          // 에러 발생시에도 시스템 메트릭 수집
          const metrics = await this.systemMetricsService.getMetrics();

          this.logger.error(
            '❌ Socket Event Error\n' +
              logs.join('\n') +
              `\nError: ${error.message}\n` +
              '\nSystem Metrics:\n' +
              `CPU Usage: ${metrics.cpu.toFixed(2)}%\n` +
              '\nMemory Usage:\n' +
              `System Total: ${metrics.memory.system.total}GB\n` +
              `System Used: ${metrics.memory.system.used}GB (${metrics.memory.system.usagePercentage}%)\n` +
              `System Free: ${metrics.memory.system.free}GB\n` +
              `Process Heap: ${metrics.memory.process.heapUsed}MB / ${metrics.memory.process.heapTotal}MB\n` +
              `Process RSS: ${metrics.memory.process.rss}MB\n` +
              '\nMySQL Connections:\n' +
              `Total: ${metrics.mysql.total}, ` +
              `Active: ${metrics.mysql.active}, ` +
              `Idle: ${metrics.mysql.idle}, ` +
              `Waiting: ${metrics.mysql.waiting}\n` +
              '\nRedis Connections:\n' +
              `Connected Clients: ${metrics.redis.connectedClients}, ` +
              `Used Memory: ${metrics.redis.usedMemoryMB}MB\n` +
              // `클라이언트 큐 길이: ${metrics.redis.queueLength}\n` +
              // `현재 처리중인 명령어 수 : ${metrics.redis.cmdstat}\n` +
              '============================='
          );
          subscriber.error(error);
        }
      });
    });
  }
}

/**
 * @function Trace
 * @description 서비스 메서드 추적을 위한 데코레이터
 */
export function Trace() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const className = target.constructor.name;
      const startTime = Date.now();

      const traceContext = TraceStore.getStore().getStore();
      if (traceContext) {
        traceContext.increaseDepth();
        traceContext.addLog(`[${className}.${propertyKey}] Started`);
      }

      try {
        const result = await originalMethod.apply(this, args);

        if (traceContext) {
          const executionTime = Date.now() - startTime;
          traceContext.addLog(`[${className}.${propertyKey}] Completed (${executionTime}ms)`);
          traceContext.decreaseDepth();
        }

        return result;
      } catch (error) {
        if (traceContext) {
          const executionTime = Date.now() - startTime;
          traceContext.addLog(
            `[${className}.${propertyKey}] Failed (${executionTime}ms): ${error.message}`
          );
          traceContext.decreaseDepth();
        }
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * @function TraceClass
 * @description 클래스의 모든 메서드에 추적을 적용하는 데코레이터
 */
export function TraceClass(
  options: Partial<{ excludeMethods: string[]; includePrivateMethods: boolean }> = {}
) {
  return function classDecorator<T extends { new (...args: any[]): {} }>(constructor: T) {
    const originalPrototype = constructor.prototype;

    Object.getOwnPropertyNames(originalPrototype).forEach((methodName) => {
      // 제외할 메서드 체크
      if (
        methodName === 'constructor' ||
        (!options.includePrivateMethods && methodName.startsWith('_')) ||
        options.excludeMethods?.includes(methodName)
      ) {
        return;
      }

      const descriptor = Object.getOwnPropertyDescriptor(originalPrototype, methodName);
      if (!descriptor || typeof descriptor.value !== 'function') {
        return;
      }

      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const traceContext = TraceStore.getStore().getStore();
        if (!traceContext) {
          return originalMethod.apply(this, args);
        }

        const startTime = Date.now();

        traceContext.increaseDepth();
        traceContext.addLog(`[${constructor.name}.${methodName}] Started`);

        try {
          const result = await originalMethod.apply(this, args);
          const executionTime = Date.now() - startTime;

          traceContext.addLog(`[${constructor.name}.${methodName}] Completed (${executionTime}ms)`);
          traceContext.decreaseDepth();

          return result;
        } catch (error) {
          const executionTime = Date.now() - startTime;
          traceContext.addLog(
            `[${constructor.name}.${methodName}] Failed (${executionTime}ms): ${error.message}`
          );
          traceContext.decreaseDepth();
          throw error;
        }
      };

      Object.defineProperty(originalPrototype, methodName, descriptor);
    });

    return constructor;
  };
}
