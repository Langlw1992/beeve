import { createServerFn } from "@tanstack/solid-start";
import { getRequestHeaders } from "@tanstack/solid-start/server";
import { auth, enabledSocialProviders } from "./server";

export const getSession = createServerFn({ method: "GET" }).handler(
	async () => {
		const headers = getRequestHeaders();
		return auth.api.getSession({ headers });
	},
);

export const getEnabledSocialProviders = createServerFn({
	method: "GET",
}).handler(async () => enabledSocialProviders);
