// 全域型別宣告：保持精簡，需要時再加
declare global {
  namespace App {
    interface Locals {
      pseudoUserId?: string;
    }
  }
}
export {};
