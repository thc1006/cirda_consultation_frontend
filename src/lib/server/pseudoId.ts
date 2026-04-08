// 假名 ID：把使用者輸入的代號（學號或自訂）以 HMAC-SHA256 + salt 雜湊
// 原始 ID 不入庫；後續所有資料只認 pseudoUserId
import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';

const fallback = 'dev-only-salt-please-change-in-prod-aaaaaaaaaa';

export function makePseudoId(rawId: string): string {
  let salt = env.HMAC_SALT;
  if (!salt) {
    // production 沒設 → fail fast，避免假名可被離線重算 / 撞庫
    if (process.env.NODE_ENV === 'production') {
      throw new Error('HMAC_SALT 未設定，正式環境拒絕啟動以維持去識別強度');
    }
    salt = fallback;
  }
  return crypto.createHmac('sha256', salt).update(rawId.trim()).digest('hex').slice(0, 24);
}
