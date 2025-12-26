// Tipos comuns usados em múltiplas respostas da API

export interface PaginationMeta {
    totalItems: number;
    totalPages: number;
    page: number;
    size: number;
}

export interface ErrorResponse {
    message: string;
    status: number;
    name: string;
}

export interface SuccessMessage {
    message: string;
}

