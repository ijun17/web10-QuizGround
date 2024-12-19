import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricStorageService } from './metric-storage.service';
import { MetricInterceptor } from './metric.interceptor';

@Module({
  controllers: [MetricsController],
  providers: [MetricStorageService, MetricInterceptor],
  exports: [MetricStorageService, MetricInterceptor]
})
export class MetricsModule {}
