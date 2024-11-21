import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { GameWsException } from '../exceptions/game.ws.exception';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  private logger = new Logger('WsExceptionFilter');

  catch(exception: any, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();

    // ValidationPipe에서 발생한 에러 처리
    if (exception instanceof GameWsException) {
      this.logger.error(`Validation Error: ${JSON.stringify(exception.message)}`);

      client.emit('exception', {
        eventName: exception.eventName,
        message: exception.message || 'Validation failed'
      });
      return;
    }

    this.logger.error(`WebSocket Error: ${exception.message}`, exception.stack);

    // 일반적인 WS 예외 처리
    client.emit('exception', {
      eventName: exception.eventName,
      message: exception.message || 'Internal server error'
    });
  }
}
