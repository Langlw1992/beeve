import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { admin } from "better-auth/plugins/admin";
import { tanstackStartCookies } from "better-auth/tanstack-start/solid";
import { db } from "./db";

const appOrigin = process.env.APP_ORIGIN ?? "http://localhost:3000";

export const auth = betterAuth({
	baseURL: appOrigin,
	basePath: "/api/auth",
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	secret:
		process.env.BETTER_AUTH_SECRET ??
		"better-auth-dev-secret-change-me-in-production",
	trustedOrigins: [appOrigin, "https://appleid.apple.com"],
	emailAndPassword: {
		enabled: false,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID ?? "google-client-id",
			clientSecret:
				process.env.GOOGLE_CLIENT_SECRET ?? "google-client-secret",
			accessType: "offline",
			prompt: "select_account consent",
		},
		github: {
			clientId: process.env.GITHUB_CLIENT_ID ?? "github-client-id",
			clientSecret:
				process.env.GITHUB_CLIENT_SECRET ?? "github-client-secret",
		},
		// Apple OAuth 仅在配置了真实凭证时启用
		...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
			? {
					apple: {
						clientId: process.env.APPLE_CLIENT_ID,
						clientSecret: process.env.APPLE_CLIENT_SECRET,
						appBundleIdentifier:
							process.env.APPLE_APP_BUNDLE_IDENTIFIER,
					},
				}
			: {}),
	},
	// tanstackStartCookies 必须是最后一个插件
	plugins: [admin(), tanstackStartCookies()],
});
