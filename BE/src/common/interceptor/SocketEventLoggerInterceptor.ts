/**
 * @class SocketEventLoggerInterceptor
 * @description WebSocket 이벤트 실행 시간과 메서드 정보를 로깅하는 인터셉터
 */
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Socket } from 'socket.io';

interface SocketEventLog {
  className: string;
  methodName: string;
  event: string;
  clientId: string;
  executionTime: number;
  timestamp: string;
  payload?: any;
}

@Injectable()
export class SocketEventLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('SocketEventLogger');
  private readonly EXECUTION_TIME_THRESHOLD = 1000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'ws') {
      return next.handle();
    }

    const startTime = Date.now();
    const ctx = context.switchToWs();
    const client: Socket = ctx.getClient();
    const event = ctx.getData();

    // 현재 실행 중인 클래스와 메서드 정보 가져오기
    const className = context.getClass().name;
    const methodName = context.getHandler().name;

    return next.handle().pipe(
      tap({
        next: (data) => {
          const executionTime = Date.now() - startTime;

          const logData: SocketEventLog = {
            className,
            methodName,
            event: typeof event === 'object' ? JSON.stringify(event) : event,
            clientId: client.id,
            executionTime,
            timestamp: new Date().toISOString(),
            payload: data
          };

          if (executionTime >= this.EXECUTION_TIME_THRESHOLD) {
            this.logger.warn(
              '🐢 Slow Socket Event Detected!\n' +
                `Class: ${logData.className}\n` +
                `Method: ${logData.methodName}\n` +
                `Event: ${logData.event}\n` +
                `Client: ${logData.clientId}\n` +
                `Execution Time: ${logData.executionTime}ms\n` +
                `Timestamp: ${logData.timestamp}`
            );
          } else {
            this.logger.log(
              '🚀 Socket Event Processed\n' +
                `Class: ${logData.className}\n` +
                `Method: ${logData.methodName}\n` +
                `Event: ${logData.event}\n` +
                `Client: ${logData.clientId}\n` +
                `Execution Time: ${logData.executionTime}ms`
            );
          }
        },
        error: (error) => {
          this.logger.error(
            '❌ Socket Event Error\n' +
              `Class: ${className}\n` +
              `Method: ${methodName}\n` +
              `Event: ${event}\n` +
              `Client: ${client.id}\n` +
              `Error: ${error.message}`
          );
        }
      })
    );
  }
}
