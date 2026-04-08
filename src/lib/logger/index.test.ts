import { describe, it, expect } from 'vitest';
import { logger } from './index';

describe('logger', () => {
  it('event 會進 buffer', () => {
    logger._drain(); // 清空
    logger.event('first_token', { latencyMs: 123 });
    logger.event('last_token');
    const items = logger._drain();
    expect(items.length).toBe(2);
    expect(items[0].type).toBe('first_token');
    expect(items[0].payload?.latencyMs).toBe(123);
  });
});
