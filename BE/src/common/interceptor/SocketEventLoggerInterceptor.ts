import { firstValueFrom, Observable } from 'rxjs';
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Socket } from 'socket.io';
import { AsyncLocalStorage } from 'async_hooks'; // 이 부분 추가

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

  constructor(private readonly moduleRef: ModuleRef) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'ws') {
      return next.handle();
    }

    const startTime = Date.now();
    const ctx = context.switchToWs();
    const client: Socket = ctx.getClient();
    const event = ctx.getData();
    const className = context.getClass().name;
    const methodName = context.getHandler().name;

    // 새로운 추적 컨텍스트 시작
    const traceContext = new TraceContext();

    return new Observable((subscriber) => {
      // AsyncLocalStorage를 사용하여 추적 컨텍스트 설정
      TraceStore.getStore().run(traceContext, async () => {
        try {
          // 핸들러 실행 전 로그
          traceContext.addLog(`[${className}.${methodName}] Started`);

          // 원본 핸들러 실행
          const result = await firstValueFrom(next.handle());

          const executionTime = Date.now() - startTime;
          const logs = traceContext.getLogs();

          if (executionTime >= this.EXECUTION_TIME_THRESHOLD) {
            this.logger.warn(
              '🐢 Slow Socket Event Detected!\n' +
                logs.join('\n') +
                `\nTotal Execution Time: ${executionTime}ms`
            );
          } else {
            this.logger.log(
              '🚀 Socket Event Processed\n' +
                logs.join('\n') +
                `\nTotal Execution Time: ${executionTime}ms`
            );
          }

          subscriber.next(result);
          subscriber.complete();
        } catch (error) {
          const logs = traceContext.getLogs();
          this.logger.error(
            '❌ Socket Event Error\n' + logs.join('\n') + `\nError: ${error.message}`
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
/**
 * @class TraceClass
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
