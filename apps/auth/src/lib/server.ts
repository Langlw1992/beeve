import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./server-auth";

const appOrigin = process.env.APP_ORIGIN ?? "http://localhost:3000";

// 验证 session 并获取用户信息的辅助函数
async function getSessionUser(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });
	return session?.user ?? null;
}

// Elysia 服务端实例 - 官方推荐模式
export const app = new Elysia({ prefix: "/api" })
	// CORS - Better Auth 需要
	.use(cors({ origin: appOrigin, credentials: true }))
	// health check
	.get("/health", () => ({
		status: "ok",
		service: "@beeve/auth",
		timestamp: new Date().toISOString(),
	}))
	// 获取当前用户的社交账号列表
	.get("/user/accounts", async ({ request }) => {
		const user = await getSessionUser(request);
		if (!user) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		// 调用 Better Auth API 获取用户的账号列表
		const accounts = await auth.api.listUserAccounts({ headers: request.headers });

		// 只返回社交账号信息
		const socialAccounts = accounts.map((account) => ({
			provider: account.providerId,
			providerAccountId: account.accountId,
			createdAt: account.createdAt,
		}));

		return { accounts: socialAccounts };
	})
	// 解绑社交账号
	.post("/user/accounts/:provider/unlink", async ({ params, request }) => {
		const user = await getSessionUser(request);
		if (!user) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		const { provider } = params;

		// 获取当前用户的所有账号
		const accounts = await auth.api.listUserAccounts({ headers: request.headers });

		// 检查是否至少保留一个登录方式
		if (accounts.length <= 1) {
			return new Response(
				JSON.stringify({ error: "Cannot unlink the only account" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// 找到要解绑的账号
		const accountToUnlink = accounts.find((acc) => acc.providerId === provider);
		if (!accountToUnlink) {
			return new Response(
				JSON.stringify({ error: "Account not found" }),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// 调用 Better Auth API 解绑账号
		await auth.api.unlinkAccount({
			body: {
				providerId: provider,
				accountId: accountToUnlink.id,
			},
			headers: request.headers,
		});

		return { success: true };
	})
	// better auth - 挂载所有 /api/auth/* 路由
	.mount(auth.handler)

export type App = typeof app;
