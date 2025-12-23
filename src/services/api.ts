import { API_BASE_URL, API_URL } from "@/config/api";
import { authClient } from "@/lib/auth-client";
import axios from "axios";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  // Adicionar Origin header para requisições do Electron (file:// protocol)
  // Isso resolve o erro "MISSING_OR_NULL_ORIGIN" do better-auth
  if (!config.headers.origin && !config.headers.Origin) {
    config.headers.Origin = API_BASE_URL;
  }

  try {
    const { data: session } = await authClient.getSession();
    if (session && "token" in session && session.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
  } catch (error) {
    console.error("Erro ao obter sessão:", error);
  }
  return config;
});
