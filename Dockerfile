# 多階段建置：builder → runner
# 注意：better-sqlite3 是 native module，必須在 runner 階段也存在 build 工具或預先在 builder 編好

FROM node:22-bookworm-slim AS builder
WORKDIR /app

# 安裝 native build 相依
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build && npm prune --production

# ----- runner -----
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# 只把 build artifact 與 production deps 帶過來
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# adapter-node 入口
CMD ["node", "build"]
