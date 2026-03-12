# auth-server - 认证服务后端

## 项目定位

基于 Elysia 框架的高性能认证服务，为 Beeve 产品体系提供：
- 用户认证 API（Better Auth）
- 社交登录集成（Google、GitHub、Apple）
- 数据库管理与迁移

## 技术栈

- **框架**: Elysia (Bun 运行时)
- **认证**: Better Auth + Drizzle Adapter
- **数据库**: SQLite + Drizzle ORM
- **CORS**: `@elysiajs/cors`

## 目录结构

```
src/
├── db/                  # 数据库相关
│   ├── schema.ts        # 表结构定义
│   └── index.ts         # 数据库连接
├── auth.ts              # Better Auth 配置
└── index.ts             # 服务入口
```

## 环境变量

```bash
# 服务配置
BETTER_AUTH_URL=http://localhost:3001
BETTER_AUTH_SECRET=your-secret-key
AUTH_WEB_ORIGIN=http://localhost:3000

# 社交登录（按需配置）
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
APPLE_APP_BUNDLE_IDENTIFIER=
```

## 开发命令

```bash
# 开发（使用 Bun）
bun run dev              # 启动开发服务器（带热重载）
turbo dev --filter=auth-server   # 通过 turbo 启动

# 数据库
turbo db:generate        # 生成迁移文件
turbo db:migrate         # 执行迁移
turbo db:push            # 快速同步 schema
turbo db:studio          # Drizzle Studio GUI

# 构建
turbo build --filter=auth-server
```

## Better Auth 集成

**服务端配置**: `src/auth.ts`
- 基于 Drizzle Adapter 的 SQLite 存储
- 支持 Google、GitHub、Apple 社交登录
- Admin 插件启用

**API 端点**:
- `/api/auth/*` - Better Auth 所有认证端点

## 注意事项

- 必须使用 Bun 运行（Elysia 依赖 Bun 特性）
- 开发时 auth-web 和 auth-server 需同时运行
- 数据库变更后需运行 `turbo db:generate`
