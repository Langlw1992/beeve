import { Elysia } from "elysia";
import { auth } from "./server-auth";
// Elysia 服务端实例 - 官方推荐模式
export const app = new Elysia({ prefix: "/api" })
	// health check
	.get("/health", () => ({
		status: "ok",
		service: "@beeve/auth",
		timestamp: new Date().toISOString(),
	}))
	// better auth
	.mount(auth.handler)

export type App = typeof app;
