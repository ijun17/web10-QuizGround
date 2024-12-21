import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricService } from './metric.service';
import SocketEvents from '../common/constants/socket-events';

@Injectable()
export class MetricInterceptor implements NestInterceptor {
  private readonly eventPatterns = Object.values(SocketEvents);
  private requestCounts: Map<string, number> = new Map();
  private responseCounts: Map<string, number> = new Map();

  constructor(private metricService: MetricService) {
    setInterval(() => this.updateThroughput(), 1000);
  }

  /*
  * 1초마다 이벤트 별로 throughput 업데이트
  * */
  private updateThroughput() {
    for (const [event, count] of this.requestCounts.entries()) {
      this.metricService.updateThroughput('request', count);
      this.requestCounts.set(event, 0);
    }

    for (const [event, count] of this.responseCounts.entries()) {
      this.metricService.updateThroughput('response', count);
      this.responseCounts.set(event, 0);
    }
  }

  plusResponseCount(event: string) {
    this.responseCounts.set(event, (this.responseCounts.get(event) || 0) + 1);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startedAt = process.hrtime();
    const ctx = context.switchToWs(); // WebSocket에 관한 컨텍스트를 가져옴
    const event = ctx.getPattern(); // 클라이언트가 보낸 이벤트를 가져옴 (ex. updatePosition)

    if (!this.eventPatterns.includes(event as any)) {
      return next.handle();
    }

    this.requestCounts.set(event, (this.requestCounts.get(event) || 0) + 1);

    return next.handle().pipe(
      tap({
        next: () => {
          const endedAt = process.hrtime(startedAt);
          const delta = endedAt[0] * 1e9 + endedAt[1];
          const executionTime = delta / 1e6;

          this.requestCounts.set(event, (this.requestCounts.get(event) || 0) + 1);
          this.metricService.recordRequest(event, 'success');
          this.metricService.recordLatency(event, 'request', executionTime);
        },
        error: () => {
          this.metricService.recordRequest(event, 'failure');
        }
      })
    );
  }
}