// AES-256-GCM 對稱加密：用於對話原文、量表答案等敏感欄位
// 金鑰來自 env.ENCRYPTION_KEY（base64 32 bytes）；dev 環境若未提供則用一組固定 fallback
import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';

const ALG = 'aes-256-gcm';
// dev fallback：32 bytes 固定值，僅供本機測試。正式環境必須提供 ENCRYPTION_KEY
const fallbackKey = Buffer.alloc(32, 7);

function getKey(): Buffer {
  const raw = env.ENCRYPTION_KEY;
  if (!raw) {
    // production 沒設 → fail fast，避免資料用公開 key 加密
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY 未設定，正式環境拒絕啟動以保護受試者資料');
    }
    return fallbackKey;
  }
  const buf = Buffer.from(raw, 'base64');
  if (buf.length !== 32) throw new Error('ENCRYPTION_KEY 必須為 base64 編碼的 32 bytes');
  return buf;
}

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALG, getKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join('.');
}

export function decrypt(payload: string): string {
  const [ivB64, tagB64, encB64] = payload.split('.');
  if (!ivB64 || !tagB64 || !encB64) throw new Error('密文格式錯誤');
  const decipher = crypto.createDecipheriv(ALG, getKey(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const dec = Buffer.concat([decipher.update(Buffer.from(encB64, 'base64')), decipher.final()]);
  return dec.toString('utf8');
}
