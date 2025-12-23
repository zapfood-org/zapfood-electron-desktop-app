import { authClient } from '@/lib/auth-client';
import axios from 'axios';

export const API_URL = "http://localhost:8080/api/v1";

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

api.interceptors.request.use(async (config) => {
    try {
        const { data: session } = await authClient.getSession();
        if (session && 'token' in session && session.token) {
            config.headers.Authorization = `Bearer ${session.token}`;
        }
    } catch (error) {
        console.error("Erro ao obter sessão:", error);
    }
    return config;
});
