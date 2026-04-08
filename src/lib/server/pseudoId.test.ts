import { describe, it, expect } from 'vitest';
import { makePseudoId } from './pseudoId';

describe('makePseudoId', () => {
  it('同樣輸入要產生同樣輸出', () => {
    expect(makePseudoId('s12345')).toBe(makePseudoId('s12345'));
  });
  it('不同輸入要產生不同輸出', () => {
    expect(makePseudoId('a')).not.toBe(makePseudoId('b'));
  });
  it('輸出長度 24', () => {
    expect(makePseudoId('hello').length).toBe(24);
  });
  it('前後空白不影響結果', () => {
    expect(makePseudoId('  abc ')).toBe(makePseudoId('abc'));
  });
});
