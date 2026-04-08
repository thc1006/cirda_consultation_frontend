// 假名 ID：把使用者輸入的代號（學號或自訂）以 HMAC-SHA256 + salt 雜湊
// 原始 ID 不入庫；後續所有資料只認 pseudoUserId
import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';

const fallback = 'dev-only-salt-please-change-in-prod-aaaaaaaaaa';

export function makePseudoId(rawId: string): string {
  const salt = env.HMAC_SALT || fallback;
  return crypto.createHmac('sha256', salt).update(rawId.trim()).digest('hex').slice(0, 24);
}
