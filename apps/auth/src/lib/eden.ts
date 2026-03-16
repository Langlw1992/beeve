import { treaty } from "@elysiajs/eden";
import { createIsomorphicFn } from "@tanstack/solid-start";
import { app } from "./server";
import type { App } from "./server";

// Eden Treaty 同构客户端
// 服务端：直接调用，零 HTTP 开销
// 客户端：HTTP 请求到 /api
export const api = createIsomorphicFn()
	.server(() => treaty(app).api)
	.client(() => treaty<App>("localhost:3000").api);
