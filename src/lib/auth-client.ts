import { AUTH_URL } from "@/config/api";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
  plugins: [organizationClient()],
  fetch: (input: RequestInfo | URL, init: RequestInit) => {
    return fetch(input, {
      ...init,
      credentials: "include",
      headers: {
        ...(init?.headers || {}),
        Origin: "https://zapfood.shop",
      },
    });
  },
});
