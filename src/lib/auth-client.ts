import { AUTH_URL } from "@/config/api";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
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
