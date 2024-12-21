import { Injectable } from '@nestjs/common';
import * as promClient from 'prom-client';
import { MetricSnapshot, SystemMetricSnapshot } from './interfaces/metric.interface';

@Injectable()
export class MetricService {
  private isCollecting = false;
  private collectedMetrics: MetricSnapshot[] = [];

  private systemMetricSnapshots: SystemMetricSnapshot[] = [];
  private startSystemMetrics: SystemMetricSnapshot | null = null;

  private readonly requestCounter: promClient.Counter;
  private readonly responseCounter: promClient.Counter;
  private readonly latencyHistogram: promClient.Histogram;
  private readonly throughputGauge: promClient.Gauge;
  private readonly systemMetrics: {
    cpu: promClient.Gauge;
    memory: promClient.Gauge;
    network: promClient.Gauge;
  };

  constructor() {
    this.requestCounter = new promClient.Counter({
      name: 'socket_requests_total',
      help: 'Total number of socket requests',
      labelNames: ['event', 'status']
    });

    this.responseCounter = new promClient.Counter({
      name: 'socket_responses_total',
      help: 'Total number of socket responses',
      labelNames: ['event', 'status']
    });

    this.latencyHistogram = new promClient.Histogram({
      name: 'socket_latency_seconds',
      help: 'Latency of socket operations in seconds',
      labelNames: ['event', 'operation'],
      buckets: promClient.linearBuckets(0, 0.1, 10)
    });

    this.throughputGauge = new promClient.Gauge({
      name: 'socket_throughput',
      help: 'Number of operations per second',
      labelNames: ['operation']
    });

    this.systemMetrics = {
      cpu: new promClient.Gauge({
        name: 'system_cpu_usage',
        help: 'CPU usage percentage'
      }),
      memory: new promClient.Gauge({
        name: 'system_memory_usage',
        help: 'Memory usage in bytes'
      }),
      network: new promClient.Gauge({
        name: 'system_network_usage',
        help: 'Network usage in bytes'
      })
    };

    this.startCollectingSystemMetrics();
  }

  private startCollectingSystemMetrics() {
    setInterval(async () => {
      const metrics = await this.getSystemMetrics();

      // 기존 게이지 업데이트
      this.systemMetrics.cpu.set(metrics.cpu);
      this.systemMetrics.memory.set(metrics.memory);

      // 수집 중일 때만 스냅샷 저장
      if (this.isCollecting) {
        this.systemMetricSnapshots.push(metrics);
      }
    }, 1000);
  }

  private async getSystemMetrics(): Promise<SystemMetricSnapshot> {
    const usage = process.cpuUsage();
    const memoryUsage = process.memoryUsage();

    return {
      cpu: (usage.user + usage.system) / 1e6,
      memory: memoryUsage.heapUsed,
      timestamp: Date.now()
    };
  }

  async startCollecting(): Promise<void> {
    this.isCollecting = true;
    this.collectedMetrics = [];
    this.systemMetricSnapshots = [];
    this.startSystemMetrics = await this.getSystemMetrics();
  }

  async stopCollecting(): Promise<any> {
    this.isCollecting = false;
    const applicationStats = this.calculateStats();
    const systemStats = this.calculateSystemStats();

    return {
      application: applicationStats,
      system: systemStats
    };
  }

  async isCurrentlyCollecting(): Promise<boolean> {
    return this.isCollecting;
  }

  recordRequest(event: string, status: 'success' | 'failure') {
    this.requestCounter.labels(event, status).inc();
  }

  recordResponse(event: string, status: 'success' | 'failure') {
    this.responseCounter.labels(event, status).inc();
  }

  recordLatency(event: string, operation: 'request' | 'response', duration: number) {
    this.latencyHistogram.labels(event, operation).observe(duration / 1000);

    if (this.isCollecting) {
      this.collectedMetrics.push({
        eventType: event,
        operation: operation,
        executionTime: duration,
        timestamp: Date.now()
      });
    }
  }

  updateThroughput(operation: 'request' | 'response', count: number) {
    this.throughputGauge.labels(operation).set(count);
  }

  private calculateStats() {
    const operationMetrics = {
      request: this.collectedMetrics.filter(m => m.operation === 'request'),
      response: this.collectedMetrics.filter(m => m.operation === 'response')
    };

    const result = {};

    for (const [operation, metrics] of Object.entries(operationMetrics)) {
      const eventTypes = [...new Set(metrics.map(m => m.eventType))];
      const allExecutionTimes = metrics.map(m => m.executionTime).sort((a, b) => a - b);

      const eventStats = {};
      for (const eventType of eventTypes) {
        const eventMetrics = metrics.filter(m => m.eventType === eventType);
        const executionTimes = eventMetrics.map(m => m.executionTime).sort((a, b) => a - b);

        eventStats[eventType] = {
          count: eventMetrics.length,
          mean: this.calculateAverage(executionTimes),
          max: Math.max(...executionTimes),
          min: Math.min(...executionTimes),
          p50: this.calculatePercentile(executionTimes, 50),
          p80: this.calculatePercentile(executionTimes, 80),
          p90: this.calculatePercentile(executionTimes, 90),
          p95: this.calculatePercentile(executionTimes, 95),
          p99: this.calculatePercentile(executionTimes, 99)
        };
      }

      result[operation] = {
        summary: {
          totalEvents: metrics.length,
          averageExecutionTime: this.calculateAverage(allExecutionTimes),
          maxExecutionTime: allExecutionTimes.length ? Math.max(...allExecutionTimes) : 0,
          minExecutionTime: allExecutionTimes.length ? Math.min(...allExecutionTimes) : 0,
          p50: this.calculatePercentile(allExecutionTimes, 50),
          p80: this.calculatePercentile(allExecutionTimes, 80),
          p90: this.calculatePercentile(allExecutionTimes, 90),
          p95: this.calculatePercentile(allExecutionTimes, 95),
          p99: this.calculatePercentile(allExecutionTimes, 99)
        },
        eventStats
      };
    }

    return result;
  }

  private calculateSystemStats() {
    if (!this.startSystemMetrics || this.systemMetricSnapshots.length === 0) {
      return null;
    }

    const endMetrics = this.systemMetricSnapshots[this.systemMetricSnapshots.length - 1];

    const cpuValues = this.systemMetricSnapshots.map(m => m.cpu);
    const memoryValues = this.systemMetricSnapshots.map(m => m.memory);

    return {
      duration: {
        start: new Date(this.startSystemMetrics.timestamp).toLocaleString('ko-KR'),
        end: new Date(endMetrics.timestamp).toLocaleString('ko-KR'),
        seconds: `${(endMetrics.timestamp - this.startSystemMetrics.timestamp) / 1000}s`
      },
      // cpu: {
      //   start: this.startSystemMetrics.cpu,
      //   end: endMetrics.cpu,
      //   min: Math.min(...cpuValues),
      //   max: Math.max(...cpuValues),
      //   mean: this.calculateAverage(cpuValues),
      //   p95: this.calculatePercentile(cpuValues.sort((a, b) => a - b), 95)
      // },
      // memory: {
      //   start: this.startSystemMetrics.memory,
      //   end: endMetrics.memory,
      //   min: Math.min(...memoryValues),
      //   max: Math.max(...memoryValues),
      //   mean: this.calculateAverage(memoryValues),
      //   p95: this.calculatePercentile(memoryValues.sort((a, b) => a - b), 95)
      // }
    };
  }

  private calculatePercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[index];
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
}