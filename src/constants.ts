import { LogEntry, Severity } from './types';

export const SOURCES = ['auth-service', 'payment-gateway', 'user-api', 'database-cluster', 'frontend-edge'];

export const SEVERITIES: Severity[] = ['debug', 'info', 'warn', 'error'];

export function generateMockLogs(count: number): LogEntry[] {
  const logs: LogEntry[] = [];
  const messages = [
    'Connection established to server',
    'User login successful',
    'Failed to fetch user data',
    'Database query timeout',
    'Cache miss for key: user_profile',
    'Invalid API key provided',
    'Rate limit exceeded for IP',
    'Successfully processed payment',
    'Disk space low on node 4',
    'Service restarted',
  ];

  for (let i = 0; i < count; i++) {
    const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
    const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const timestamp = new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString();

    logs.push({
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      source,
      message,
      severity,
      metadata: {
        latency: Math.floor(Math.random() * 500) + 'ms',
        region: 'us-east-1',
        requestId: Math.random().toString(36).substr(2, 12),
      },
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
