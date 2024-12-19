import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricStorageService } from './metric-storage.service';

@Injectable()
export class MetricInterceptor implements NestInterceptor {
  constructor(private metricStorage: MetricStorageService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!this.metricStorage.isCollecting()) {
      return next.handle();
    }

    const startedAt = process.hrtime();
    const handlerName = context.getHandler().name;

    return next.handle().pipe(
      tap(() => {
        const endedAt = process.hrtime(startedAt);
        const delta = endedAt[0] * 1e9 + endedAt[1];
        const responseTime = delta / 1e6;

        this.metricStorage.addMetric({
          timestamp: new Date(),
          eventType: handlerName,
          responseTime,
        });
      })
    );
  }
}