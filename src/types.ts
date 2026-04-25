export type Severity = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  severity: Severity;
  metadata?: Record<string, any>;
}

export interface LogFilter {
  search: string;
  sources: string[];
  severities: Severity[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export interface LogMetrics {
  totalLogs: number;
  errorCount: number;
  warnCount: number;
  logsBySource: Record<string, number>;
  logsOverTime: { timestamp: string; count: number }[];
}
