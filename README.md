# 諮心好友 Web 聊天介面

陽明交通大學教育研究所「低資源華語心理壓力語料庫」研究案的 Web 互動介面。
非醫療、非治療性之情緒支持與減壓對話工具，採 CBT/DBT 框架。

## 技術棧
SvelteKit 5（Runes）+ TypeScript + Vite 6 + Tailwind 3 + better-sqlite3 + Playwright。

## 啟動

```
npm install
npm run dev
```

## 測試

```
npm run test         # 單元 + 元件
npm run test:e2e     # Playwright 端對端
```

詳細決策請見 `docs/adr/0001-web-chat-interface.md` 與 `todolist.md`。
