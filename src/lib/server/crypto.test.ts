import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from './crypto';

describe('crypto', () => {
  it('加解密 round-trip', () => {
    const t = '今天好累，想找人聊聊';
    expect(decrypt(encrypt(t))).toBe(t);
  });
  it('每次密文不同（IV 隨機）', () => {
    expect(encrypt('hello')).not.toBe(encrypt('hello'));
  });
  it('破壞密文要丟錯', () => {
    const c = encrypt('abc');
    expect(() => decrypt(c.replace(/[a-z]/, 'X'))).toThrow();
  });
});
