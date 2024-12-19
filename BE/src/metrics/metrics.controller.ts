import { Controller, Post } from '@nestjs/common';
import { MetricStorageService } from './metric-storage.service';

@Controller('metrics')
export class MetricsController {
  constructor(private metricStorage: MetricStorageService) {}

  @Post('start')
  startMetrics() {
    this.metricStorage.startCollecting();
    return { success: true, message: 'Started collecting metrics' };
  }

  @Post('stop')
  stopMetrics(): any {
    const metrics = this.metricStorage.stopAndGetMetrics();
    const eventTypes = [...new Set(metrics.map(m => m.eventType))];
    const allResponseTimes = metrics.map(m => m.responseTime).sort((a, b) => a - b);

    const eventStats = {};
    for (const eventType of eventTypes) {
      const eventMetrics = metrics.filter(m => m.eventType === eventType);
      const responseTimes = eventMetrics.map(m => m.responseTime).sort((a, b) => a - b);

      eventStats[eventType] = {
        count: eventMetrics.length,
        mean: this.calculateAverage(eventMetrics),
        max: this.calculateMax(eventMetrics),
        min: this.calculateMin(eventMetrics),
        p50: this.calculatePercentile(responseTimes, 50),
        p80: this.calculatePercentile(responseTimes, 80),
        p90: this.calculatePercentile(responseTimes, 90),
        p95: this.calculatePercentile(responseTimes, 95),
        p99: this.calculatePercentile(responseTimes, 99)
      };
    }

    return {
      success: true,
      summary: {
        totalEvents: metrics.length,
        averageResponseTime: this.calculateAverage(metrics),
        maxResponseTime: this.calculateMax(metrics),
        minResponseTime: this.calculateMin(metrics),
        p50: this.calculatePercentile(allResponseTimes, 50),
        p80: this.calculatePercentile(allResponseTimes, 80),
        p90: this.calculatePercentile(allResponseTimes, 90),
        p95: this.calculatePercentile(allResponseTimes, 95),
        p99: this.calculatePercentile(allResponseTimes, 99)
      },
      eventStats
    };
  }

  private calculatePercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;

    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[index];
  }

  private calculateAverage(metrics: any[]) {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
  }

  private calculateMax(metrics: any[]) {
    if (metrics.length === 0) return 0;
    return Math.max(...metrics.map(m => m.responseTime));
  }

  private calculateMin(metrics: any[]) {
    if (metrics.length === 0) return 0;
    return Math.min(...metrics.map(m => m.responseTime));
  }
}
