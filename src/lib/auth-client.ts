import { API_BASE_URL, AUTH_URL } from "@/config/api";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
  plugins: [organizationClient()],
  fetchOptions: {
    credentials: "include",
    // Adicionar Origin header para requisições do Electron (file:// protocol)
    // Isso resolve o erro "MISSING_OR_NULL_ORIGIN" do better-auth
    headers: {
      Origin: API_BASE_URL,
    },
  },
});
