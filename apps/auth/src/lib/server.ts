import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./server-auth";
import { Pool } from "pg";

const appOrigin = process.env.APP_ORIGIN ?? "http://localhost:3000";

// 数据库连接池
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

// 验证 session 并获取用户信息的辅助函数
async function getSessionUser(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });
	return session?.user ?? null;
}

// 验证管理员权限的辅助函数
async function requireAdmin(request: Request) {
	const user = await getSessionUser(request);
	if (!user) {
		return { error: "Unauthorized", status: 401 };
	}
	const role = (user as { role?: string }).role;
	if (role !== "admin") {
		return { error: "Forbidden", status: 403 };
	}
	return { user };
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
	// Admin API - 用户列表
	.get("/admin/users", async ({ request, query }) => {
		const adminCheck = await requireAdmin(request);
		if ("error" in adminCheck) {
			return new Response(JSON.stringify({ error: adminCheck.error }), {
				status: adminCheck.status,
				headers: { "Content-Type": "application/json" },
			});
		}

		const limit = Math.min(Number.parseInt(query?.limit ?? "20"), 100);
		const offset = Number.parseInt(query?.offset ?? "0");
		const search = query?.search?.trim();

		try {
			let usersQuery = "SELECT id, name, email, image, role, banned, created_at, updated_at FROM \"user\"";
			const params: (string | number)[] = [];
			const countParams: (string | number)[] = [];

			if (search) {
				usersQuery += " WHERE name ILIKE $1 OR email ILIKE $1";
				params.push(`%${search}%`);
				countParams.push(`%${search}%`);
			}

			usersQuery += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
			params.push(limit, offset);

			const countQuery = search
				? "SELECT COUNT(*) FROM \"user\" WHERE name ILIKE $1 OR email ILIKE $1"
				: "SELECT COUNT(*) FROM \"user\"";

			const [usersResult, countResult] = await Promise.all([
				pool.query(usersQuery, params),
				pool.query(countQuery, countParams),
			]);

			return {
				users: usersResult.rows,
				pagination: {
					total: Number.parseInt(countResult.rows[0].count),
					limit,
					offset,
				},
			};
		} catch (error) {
			console.error("Admin users query error:", error);
			return new Response(JSON.stringify({ error: "Internal server error" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	})
	// Admin API - 用户详情
	.get("/admin/users/:id", async ({ params, request }) => {
		const adminCheck = await requireAdmin(request);
		if ("error" in adminCheck) {
			return new Response(JSON.stringify({ error: adminCheck.error }), {
				status: adminCheck.status,
				headers: { "Content-Type": "application/json" },
			});
		}

		try {
			const userResult = await pool.query(
				"SELECT id, name, email, image, role, banned, created_at, updated_at FROM \"user\" WHERE id = $1",
				[params.id],
			);

			if (userResult.rows.length === 0) {
				return new Response(JSON.stringify({ error: "User not found" }), {
					status: 404,
					headers: { "Content-Type": "application/json" },
				});
			}

			// 获取用户的会话数量
			const sessionsResult = await pool.query(
				"SELECT COUNT(*) FROM \"session\" WHERE user_id = $1 AND expires_at > NOW()",
				[params.id],
			);

			// 获取用户的社交账号
			const accountsResult = await pool.query(
				"SELECT provider_id, created_at FROM \"account\" WHERE user_id = $1",
				[params.id],
			);

			return {
				user: userResult.rows[0],
				sessions: Number.parseInt(sessionsResult.rows[0].count),
				accounts: accountsResult.rows,
			};
		} catch (error) {
			console.error("Admin user detail error:", error);
			return new Response(JSON.stringify({ error: "Internal server error" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	})
	// Admin API - 更新用户
	.put("/admin/users/:id", async ({ params, request, body }) => {
		const adminCheck = await requireAdmin(request);
		if ("error" in adminCheck) {
			return new Response(JSON.stringify({ error: adminCheck.error }), {
				status: adminCheck.status,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Prevent self-demotion
		if (params.id === adminCheck.user.id && (body as { role?: string }).role !== "admin") {
			return new Response(JSON.stringify({ error: "Cannot change your own admin status" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		try {
			const updates: string[] = [];
			const values: unknown[] = [];
			let paramIndex = 1;

			if ((body as { role?: string }).role !== undefined) {
				updates.push(`role = $${paramIndex++}`);
				values.push((body as { role?: string }).role);
			}

			if ((body as { banned?: boolean }).banned !== undefined) {
				updates.push(`banned = $${paramIndex++}`);
				values.push((body as { banned?: boolean }).banned);
			}

			if ((body as { name?: string }).name !== undefined) {
				updates.push(`name = $${paramIndex++}`);
				values.push((body as { name?: string }).name);
			}

			if (updates.length === 0) {
				return new Response(JSON.stringify({ error: "No fields to update" }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			}

			values.push(params.id);
			const query = `UPDATE "user" SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING id, name, email, image, role, banned, created_at, updated_at`;

			const result = await pool.query(query, values);

			if (result.rows.length === 0) {
				return new Response(JSON.stringify({ error: "User not found" }), {
					status: 404,
					headers: { "Content-Type": "application/json" },
				});
			}

			return { user: result.rows[0] };
		} catch (error) {
			console.error("Admin update user error:", error);
			return new Response(JSON.stringify({ error: "Internal server error" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	})
	// Admin API - 删除用户
	.delete("/admin/users/:id", async ({ params, request }) => {
		const adminCheck = await requireAdmin(request);
		if ("error" in adminCheck) {
			return new Response(JSON.stringify({ error: adminCheck.error }), {
				status: adminCheck.status,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Prevent self-deletion
		if (params.id === adminCheck.user.id) {
			return new Response(JSON.stringify({ error: "Cannot delete yourself" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		try {
			// 删除用户（级联删除相关记录）
			const result = await pool.query(
				"DELETE FROM \"user\" WHERE id = $1 RETURNING id",
				[params.id],
			);

			if (result.rows.length === 0) {
				return new Response(JSON.stringify({ error: "User not found" }), {
					status: 404,
					headers: { "Content-Type": "application/json" },
				});
			}

			return { success: true };
		} catch (error) {
			console.error("Admin delete user error:", error);
			return new Response(JSON.stringify({ error: "Internal server error" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	})
	// Admin API - 统计数据
	.get("/admin/stats", async ({ request }) => {
		const adminCheck = await requireAdmin(request);
		if ("error" in adminCheck) {
			return new Response(JSON.stringify({ error: adminCheck.error }), {
				status: adminCheck.status,
				headers: { "Content-Type": "application/json" },
			});
		}

		try {
			const [
				usersResult,
				sessionsResult,
				activeSessionsResult,
				accountsResult,
			] = await Promise.all([
				pool.query("SELECT COUNT(*) FROM \"user\""),
				pool.query("SELECT COUNT(*) FROM \"session\""),
				pool.query("SELECT COUNT(*) FROM \"session\" WHERE expires_at > NOW()"),
				pool.query("SELECT COUNT(*) FROM \"account\""),
			]);

			return {
				totalUsers: Number.parseInt(usersResult.rows[0].count),
				totalSessions: Number.parseInt(sessionsResult.rows[0].count),
				activeSessions: Number.parseInt(activeSessionsResult.rows[0].count),
				linkedAccounts: Number.parseInt(accountsResult.rows[0].count),
			};
		} catch (error) {
			console.error("Admin stats error:", error);
			return new Response(JSON.stringify({ error: "Internal server error" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	})
	// better auth - 挂载所有 /api/auth/* 路由
	.mount(auth.handler)
	// --- Reminders CRUD ---
	.get("/reminders", async ({ request }) => {
		const user = await getSessionUser(request);
		if (!user) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}
		try {
			// Ensure reminders table exists
			await pool.query(`
				CREATE TABLE IF NOT EXISTS reminder (
					id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
					user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
					title TEXT NOT NULL,
					note TEXT DEFAULT '',
					due_date TIMESTAMPTZ,
					category TEXT DEFAULT 'work',
					priority TEXT DEFAULT 'medium',
					is_completed BOOLEAN DEFAULT FALSE,
					sort_order INTEGER DEFAULT 0,
					repeat_rule JSONB,
					created_at TIMESTAMPTZ DEFAULT NOW(),
					updated_at TIMESTAMPTZ DEFAULT NOW()
				)
			`);
			const result = await pool.query(
				"SELECT * FROM reminder WHERE user_id = $1 ORDER BY sort_order, created_at DESC",
				[user.id],
			);
			return { reminders: result.rows };
		} catch (error) {
			console.error("Fetch reminders error:", error);
			return new Response(JSON.stringify({ error: "Internal server error" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	})
	.post("/reminders", async ({ request, body }) => {
		const user = await getSessionUser(request);
		if (!user) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}
		const { title, note, dueDate, category, priority, repeatRule } = body as {
			title: string;
			note?: string;
			dueDate?: string;
			category?: string;
			priority?: string;
			repeatRule?: unknown;
		};
		try {
			const result = await pool.query(
				`INSERT INTO reminder (user_id, title, note, due_date, category, priority, repeat_rule)
				 VALUES ($1, $2, $3, $4, $5, $6, $7)
				 RETURNING *`,
				[user.id, title, note ?? "", dueDate ?? null, category ?? "work", priority ?? "medium", repeatRule ? JSON.stringify(repeatRule) : null],
			);
			return { reminder: result.rows[0] };
		} catch (error) {
			console.error("Create reminder error:", error);
			return new Response(JSON.stringify({ error: "Internal server error" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	})
	.put("/reminders/:id", async ({ params, request, body }) => {
		const user = await getSessionUser(request);
		if (!user) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}
		const { title, note, dueDate, category, priority, isCompleted, sortOrder, repeatRule } = body as {
			title?: string;
			note?: string;
			dueDate?: string | null;
			category?: string;
			priority?: string;
			isCompleted?: boolean;
			sortOrder?: number;
			repeatRule?: unknown;
		};
		try {
			const result = await pool.query(
				`UPDATE reminder SET
					title = COALESCE($1, title),
					note = COALESCE($2, note),
					due_date = COALESCE($3, due_date),
					category = COALESCE($4, category),
					priority = COALESCE($5, priority),
					is_completed = COALESCE($6, is_completed),
					sort_order = COALESCE($7, sort_order),
					repeat_rule = COALESCE($8, repeat_rule),
					updated_at = NOW()
				 WHERE id = $9 AND user_id = $10
				 RETURNING *`,
				[title, note, dueDate, category, priority, isCompleted, sortOrder, repeatRule ? JSON.stringify(repeatRule) : null, params.id, user.id],
			);
			if (result.rows.length === 0) {
				return new Response(JSON.stringify({ error: "Not found" }), {
					status: 404,
					headers: { "Content-Type": "application/json" },
				});
			}
			return { reminder: result.rows[0] };
		} catch (error) {
			console.error("Update reminder error:", error);
			return new Response(JSON.stringify({ error: "Internal server error" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	})
	.delete("/reminders/:id", async ({ params, request }) => {
		const user = await getSessionUser(request);
		if (!user) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}
		try {
			const result = await pool.query(
				"DELETE FROM reminder WHERE id = $1 AND user_id = $2 RETURNING id",
				[params.id, user.id],
			);
			if (result.rows.length === 0) {
				return new Response(JSON.stringify({ error: "Not found" }), {
					status: 404,
					headers: { "Content-Type": "application/json" },
				});
			}
			return { success: true };
		} catch (error) {
			console.error("Delete reminder error:", error);
			return new Response(JSON.stringify({ error: "Internal server error" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	})
	.post("/reminders/sync", async ({ request, body }) => {
		const user = await getSessionUser(request);
		if (!user) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}
		const reminders = body as Array<{
			id: string;
			title: string;
			note: string;
			dueDate?: string | null;
			category: string;
			priority: string;
			isCompleted: boolean;
			updatedAt: string;
		}>;
		try {
			let synced = 0;
			for (const r of reminders) {
				await pool.query(
					`INSERT INTO reminder (id, user_id, title, note, due_date, category, priority, is_completed, updated_at)
					 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
					 ON CONFLICT (id) DO UPDATE SET
						title = EXCLUDED.title,
						note = EXCLUDED.note,
						due_date = EXCLUDED.due_date,
						category = EXCLUDED.category,
						priority = EXCLUDED.priority,
						is_completed = EXCLUDED.is_completed,
						updated_at = EXCLUDED.updated_at
					 WHERE reminder.updated_at < EXCLUDED.updated_at`,
					[r.id, user.id, r.title, r.note, r.dueDate ?? null, r.category, r.priority, r.isCompleted, r.updatedAt],
				);
				synced++;
			}
			return { synced, conflicts: 0 };
		} catch (error) {
			console.error("Sync reminders error:", error);
			return new Response(JSON.stringify({ error: "Internal server error" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	})
	// --- AI Chat ---
	.post("/ai/chat", async ({ request, body }) => {
		const user = await getSessionUser(request);
		// AI works for both authenticated and unauthenticated users
		const { message, context } = body as {
			message: string;
			context: { pendingCount: number; completedCount: number; inboxCount: number; nextImportantTitle?: string };
		};

		// Try OpenAI if configured
		const apiKey = process.env.OPENAI_API_KEY;
		if (apiKey) {
			try {
				const systemPrompt = `你是 Beeve，一个温和、实用的个人效率助手。
用户当前状态：待处理 ${context.pendingCount} 项，已完成 ${context.completedCount} 项，收件箱 ${context.inboxCount} 项。
${context.nextImportantTitle ? `最重要的下一件事：「${context.nextImportantTitle}」` : ""}
请用简洁中文回答，给出具体可执行的建议。不要超过 100 字。`;

				const response = await fetch("https://api.openai.com/v1/chat/completions", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${apiKey}`,
					},
					body: JSON.stringify({
						model: "gpt-4o-mini",
						messages: [
							{ role: "system", content: systemPrompt },
							{ role: "user", content: message },
						],
						max_tokens: 200,
						temperature: 0.7,
					}),
				});

				const data = (await response.json()) as {
					choices: Array<{ message: { content: string } }>;
				};
				const reply = data.choices?.[0]?.message?.content ?? "抱歉，暂时无法回复。";

				return {
					reply,
					suggestions: ["帮我安排今天", "拆解下一步", "专注建议"],
				};
			} catch (error) {
				console.error("OpenAI error:", error);
			}
		}

		// Fallback: rule-based reply
		let reply = "我可以帮你安排今天、拆任务、建议专注节奏，或者把想法转成提醒。";
		if (message.includes("安排") || message.includes("下午")) {
			reply = context.nextImportantTitle
				? `建议先用 25 分钟推进「${context.nextImportantTitle}」，然后花 10 分钟处理零碎事项。`
				: "目前列表比较空，适合先收集任务再决定优先级。";
		} else if (message.includes("拆解") || message.includes("下一步")) {
			reply = context.nextImportantTitle
				? `把「${context.nextImportantTitle}」拆成三步：定义结果、推进第一段、留 5 分钟检查。`
				: "先选出一件最想推进的事，再帮你拆解。";
		}

		return {
			reply,
			suggestions: ["帮我安排今天", "拆解下一步", "专注建议"],
		};
	})

export type App = typeof app;
