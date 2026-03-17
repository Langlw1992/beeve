import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./auth/server";

const appOrigin = process.env.APP_ORIGIN ?? "http://localhost:3000";

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
	.mount(auth.handler);

export type App = typeof app;
