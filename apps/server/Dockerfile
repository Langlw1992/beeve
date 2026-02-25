# ==================== Beeve Server Dockerfile ====================
# 多阶段构建：Node.js 用于安装依赖和构建，Bun 用于生产运行时
#
# 构建命令（从项目根目录执行）：
#   docker build -f apps/server/Dockerfile -t beeve-server .
#
# 运行命令：
#   docker run -p 3000:3000 --env-file apps/server/.env beeve-server

# ==================== 阶段 1: 安装依赖并构建 ====================
FROM node:20-slim AS builder

# 启用 corepack 以使用 pnpm
RUN corepack enable

WORKDIR /app

# 复制 workspace 配置文件（利用 Docker 层缓存）
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.json ./

# 复制所有 workspace 包的 package.json（pnpm --frozen-lockfile 需要完整的 workspace 结构）
COPY packages/db/package.json packages/db/
COPY packages/ui/package.json packages/ui/
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY apps/storybook/package.json apps/storybook/
COPY apps/ui-doc/package.json apps/ui-doc/

# 安装所有依赖（含 devDependencies，因为构建 @beeve/db 需要 tsup）
RUN pnpm install --frozen-lockfile

# 复制需要的源码
COPY packages/db/src/ packages/db/src/
COPY packages/db/tsconfig.json packages/db/
COPY packages/db/tsup.config.ts packages/db/
COPY apps/server/src/ apps/server/src/
COPY apps/server/tsconfig.json apps/server/

# 构建 @beeve/db（生成 dist/ 产物，server 运行时依赖这些产物）
RUN pnpm --filter @beeve/db build

# 使用 pnpm deploy 裁剪为仅包含 server 的生产依赖
# 这会将 @beeve/db（含 dist/）和所有生产依赖复制到 /app/deployed
RUN pnpm deploy --filter @beeve/server --prod /app/deployed

# ==================== 阶段 2: 生产运行时 ====================
FROM oven/bun:1-slim AS production

# 安装 curl 用于健康检查
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 从构建阶段复制部署产物（包含 node_modules 和 package.json）
COPY --from=builder /app/deployed ./

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 以非 root 用户运行（安全最佳实践）
USER bun

# 启动服务（Bun 直接运行 TypeScript，无需编译步骤）
CMD ["bun", "src/index.ts"]

