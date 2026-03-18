import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { admin } from "better-auth/plugins/admin";
import { tanstackStartCookies } from "better-auth/tanstack-start/solid";
import { db } from "./db";
import * as schema from "./schema";

const appOrigin =
	process.env.BETTER_AUTH_URL ??
	process.env.APP_ORIGIN ??
	"http://localhost:3000";

function getAuthSecret() {
	const secret = process.env.BETTER_AUTH_SECRET;

	if (secret) {
		return secret;
	}

	if (process.env.NODE_ENV === "production") {
		throw new Error(
			"BETTER_AUTH_SECRET is required in production and must be high entropy.",
		);
	}

	return "better-auth-dev-secret-change-me-in-production";
}

function getOptionalOAuthCredentials(
	provider: string,
	clientIdEnv: string,
	clientSecretEnv: string,
) {
	const clientId = process.env[clientIdEnv];
	const clientSecret = process.env[clientSecretEnv];

	if (!clientId && !clientSecret) {
		return null;
	}

	if (!clientId || !clientSecret) {
		throw new Error(
			`${provider} OAuth requires both ${clientIdEnv} and ${clientSecretEnv}.`,
		);
	}

	return { clientId, clientSecret };
}

const googleOAuth = getOptionalOAuthCredentials(
	"Google",
	"GOOGLE_CLIENT_ID",
	"GOOGLE_CLIENT_SECRET",
);

const githubOAuth = getOptionalOAuthCredentials(
	"GitHub",
	"GITHUB_CLIENT_ID",
	"GITHUB_CLIENT_SECRET",
);

const appleOAuth = getOptionalOAuthCredentials(
	"Apple",
	"APPLE_CLIENT_ID",
	"APPLE_CLIENT_SECRET",
);

export const enabledSocialProviders = {
	google: Boolean(googleOAuth),
	github: Boolean(githubOAuth),
	apple: Boolean(appleOAuth),
} as const;

export const auth = betterAuth({
	baseURL: appOrigin,
	basePath: "/api/auth",
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	secret: getAuthSecret(),
	trustedOrigins: [appOrigin, "https://appleid.apple.com"],
	emailAndPassword: {
		enabled: false,
	},
	socialProviders: {
		...(googleOAuth
			? {
					google: {
						...googleOAuth,
						accessType: "offline",
						prompt: "select_account consent",
					},
				}
			: {}),
		...(githubOAuth
			? {
					github: githubOAuth,
				}
			: {}),
		// Apple OAuth 仅在配置了真实凭证时启用
		...(appleOAuth
			? {
					apple: {
						...appleOAuth,
						appBundleIdentifier:
							process.env.APPLE_APP_BUNDLE_IDENTIFIER,
					},
				}
			: {}),
	},
	// tanstackStartCookies 必须是最后一个插件
	plugins: [admin(), tanstackStartCookies()],
});
