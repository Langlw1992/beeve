# auth-web - 用户管理基础架构

## 项目定位

用户认证中心（SSO），为整个 Beeve 产品体系提供：
- 用户注册/登录
- 会话管理
- 权限控制

**后续产品**将基于此认证体系扩展。

## 技术栈

- **框架**: SolidJS + TanStack Solid Start（SSR 支持）
- **路由**: TanStack Solid Router（文件系统路由）
- **数据获取**: TanStack Solid Query
- **认证**: Better Auth
- **样式**: Tailwind CSS v4

## 目录结构

```
src/
├── routes/              # 文件系统路由（TanStack Router）
│   ├── __root.tsx       # 根布局（HTML 骨架、全局样式）
│   ├── index.tsx        # 首页
│   ├── about.tsx        # 关于页面
│   └── api/             # API 路由（认证端点）
├── components/          # 页面组件
├── integrations/        # 第三方库集成
│   ├── better-auth/     # Better Auth 配置
│   └── tanstack-query/  # QueryClient 配置
├── lib/                 # 工具函数
│   ├── auth.ts          # 服务端 auth 实例
│   └── auth-client.ts   # 客户端 auth 实例
├── router.tsx           # 路由配置
└── styles.css           # 全局样式
```

## 路由约定

**TanStack Solid Router** 文件系统路由：

| 文件路径 | 路由路径 | 说明 |
|---------|---------|------|
| `routes/index.tsx` | `/` | 首页 |
| `routes/about.tsx` | `/about` | 静态页面 |
| `routes/api/auth.ts` | `/api/auth` | API 端点 |
| `routes/__root.tsx` | - | 根布局 |

**路由文件结构**：
```tsx
import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/path')({
  component: PageComponent,
  loader: async () => { /* 预加载数据 */ },
})

function PageComponent() {
  return <div>...</div>
}
```

## 认证集成

**Better Auth** 配置位置：
- `src/lib/auth.ts` - 服务端配置（API 路由使用）
- `src/lib/auth-client.ts` - 客户端配置（组件使用）

**在组件中使用**：
```tsx
import { authClient } from '@/lib/auth-client'

// 登录
await authClient.signIn.email({ email, password })

// 获取当前用户
const { data: session } = await authClient.getSession()
```

## 数据获取

**TanStack Solid Query** 集成：

```tsx
import { createQuery } from '@tanstack/solid-query'

function UserProfile() {
  const query = createQuery(() => ({
    queryKey: ['user'],
    queryFn: fetchUser,
  }))

  return (
    <Show when={query.data} fallback={<div>Loading...</div>}>
      {(user) => <div>{user().name}</div>}
    </Show>
  )
}
```

QueryClient 在 `router.tsx` 中通过 context 注入。

## SSR 注意事项

- 使用 `createQuery` 时数据会在服务端预取
- 访问浏览器 API（localStorage, window）需在 `onMount` 或 `isServer` 守卫中
- 根布局 `__root.tsx` 使用 `shellComponent` 模式

## 开发命令

```bash
# 开发
pnpm dev                 # 启动开发服务器（端口 3000）

# 构建
pnpm build               # 生产构建（输出到 .output/）
pnpm start               # 运行生产构建（需先 build）
pnpm preview             # 预览生产构建

# 代码质量
pnpm format              # 格式化代码
pnpm lint                # 代码检查
pnpm check               # Biome 全面检查
```

## 依赖的本地包

```json
{
  "@beeve/ui": "workspace:*"    // UI 组件库
}
```

使用 UI 组件：
```tsx
import { Button } from '@beeve/ui'
import '@beeve/ui/styles'        // 导入组件库样式
```

## 环境变量

如需添加（暂未使用）：
- `.env.local` - 本地环境变量（gitignored）
- 通过 `process.env.VAR_NAME` 访问

## 新增页面 Checklist

- [ ] 在 `src/routes/` 创建 `.tsx` 文件
- [ ] 使用 `createFileRoute` 定义路由
- [ ] 如需 API，在 `src/routes/api/` 添加端点
- [ ] 运行 `pnpm dev` 自动生成路由类型
- [ ] 确保 `router.tsx` 类型更新（自动）
