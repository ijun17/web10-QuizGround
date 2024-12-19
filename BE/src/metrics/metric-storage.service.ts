import { Injectable } from '@nestjs/common';

interface ResponseTimeMetric {
  timestamp: Date;
  eventType: string;
  responseTime: number;
}

@Injectable()
export class MetricStorageService {
  private metrics: ResponseTimeMetric[] = [];
  private isEnabled = false;

  startCollecting() {
    this.isEnabled = true;
    this.metrics = [];
  }

  addMetric(metric: ResponseTimeMetric) {
    if (this.isEnabled) {
      this.metrics.push(metric);
    }
  }

  stopAndGetMetrics() {
    this.isEnabled = false;
    return this.metrics;
  }

  isCollecting() {
    return this.isEnabled;
  }
}