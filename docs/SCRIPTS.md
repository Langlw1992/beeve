# Beeve 项目启动脚本指南

本文档说明 Beeve 项目中可用的 npm/pnpm 脚本。

## 快速开始

```bash
# 首次设置项目
pnpm setup

# 启动完整的开发环境（前端 + 后端）
pnpm dev
```

---

## 开发命令

### `pnpm dev`
同时启动前端和后端开发服务器。
- 前端: http://localhost:5174
- 后端: http://localhost:3000

### `pnpm dev:web`
只启动前端 Web 应用。
- 地址: http://localhost:5174

### `pnpm dev:server`
只启动后端 API 服务器。
- 地址: http://localhost:3000

### `pnpm dev:docs`
启动 Storybook 组件文档。
- 地址: http://localhost:6006

### `pnpm dev:all`
同时启动所有开发服务（前端 + 后端 + Storybook）。

---

## 数据库命令

### `pnpm db:generate`
生成 Drizzle ORM 数据库迁移文件。
```bash
# 修改 schema 后执行
pnpm db:generate
```

### `pnpm db:migrate`
执行数据库迁移。
```bash
pnpm db:migrate
```

### `pnpm db:push`
直接推送 schema 变更到数据库（开发环境快速同步）。
```bash
pnpm db:push
```

### `pnpm db:studio`
启动 Drizzle Studio 数据库管理界面。
- 地址: http://local.drizzle.studio

### `pnpm db:setup`
快速初始化数据库（等同于 `db:push`）。
```bash
# 首次设置项目时执行
pnpm db:setup
```

---

## 构建命令

### `pnpm build`
构建所有包和应用。

### `pnpm build:web`
只构建前端 Web 应用。

### `pnpm build:server`
只构建后端服务器。

---

## 代码质量命令

### `pnpm lint`
运行所有包的 lint 检查。

### `pnpm lint:fix`
自动修复 lint 错误。

### `pnpm format`
使用 Biome 格式化所有代码。

### `pnpm typecheck`
运行 TypeScript 类型检查。

---

## 项目维护命令

### `pnpm setup`
初始化项目：
1. 安装依赖
2. 初始化数据库

```bash
# 新成员加入项目时执行
pnpm setup
```

### `pnpm clean`
清理所有构建产物和 node_modules。
```bash
pnpm clean
```

---

## 常见工作流

### 新成员加入项目
```bash
# 1. 克隆仓库后，执行完整设置
pnpm setup

# 2. 启动开发环境
pnpm dev
```

### 日常开发
```bash
# 启动前后端
pnpm dev

# 或者只启动需要的部分
pnpm dev:web    # 只改前端
pnpm dev:server # 只改后端
```

### 修改数据库 Schema
```bash
# 1. 修改 schema 文件
# apps/server/src/db/schema/*.ts

# 2. 生成迁移
pnpm db:generate

# 3. 执行迁移
pnpm db:migrate

# 或者用 push 快速同步（开发环境）
pnpm db:push
```

### 提交代码前检查
```bash
# 运行所有检查
pnpm lint
pnpm typecheck

# 或者一键修复
pnpm lint:fix
pnpm format
```

### 查看组件文档
```bash
pnpm dev:docs
```

---

## 环境要求

- **Node.js**: >= 20
- **包管理器**: pnpm 10.22.0+
- **数据库**: PostgreSQL 14+

---

## 端口占用

| 服务 | 端口 | 说明 |
|------|------|------|
| Web 前端 | 5174 | Vite 开发服务器 |
| API 后端 | 3000 | Elysia 服务器 |
| Storybook | 6006 | 组件文档 |
| Drizzle Studio | 本地随机 | 数据库管理 |
