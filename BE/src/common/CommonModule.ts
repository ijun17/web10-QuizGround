import { SocketEventLoggerInterceptor } from './interceptor/SocketEventLoggerInterceptor';
import { Module } from '@nestjs/common';
import { SystemMetricsService } from './service/SystemMetricsService';

@Module({
  providers: [SystemMetricsService, SocketEventLoggerInterceptor],
  exports: [SocketEventLoggerInterceptor]
})
export class CommonModule {}
