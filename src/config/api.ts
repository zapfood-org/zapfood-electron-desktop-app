/**
 * Configuração da API baseada no ambiente
 *
 * Em desenvolvimento: usa localhost
 * Em produção: usa a URL de produção
 *
 * Você pode sobrescrever usando a variável de ambiente VITE_API_BASE_URL
 */

// Detectar se está em produção
const isProduction = import.meta.env.PROD;

// URL base da API (pode ser sobrescrita por variável de ambiente)
export const API_BASE_URL = isProduction
  ? "http://localhost:8080"
  : "http://localhost:8080";

// URL completa da API
export const API_URL = `${"http://localhost:8080"}/api/v1`;

// URL do auth
export const AUTH_URL = `${"http://localhost:8080"}/api/v1/auth`;

// Log apenas em desenvolvimento
if (!isProduction) {
  console.log("API Configuration:", {
    isProduction,
    API_BASE_URL,
    API_URL,
    AUTH_URL,
  });
}
