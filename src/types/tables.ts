// Tipos relacionados a mesas

export interface Table {
    id: string;
    name: string;
    restaurantId: string;
    createdAt: string | Date | number;
    updatedAt: string | Date | number;
}

export interface CreateTableRequest {
    name: string;
}

export interface UpdateTableRequest {
    name?: string;
}

export interface TablesResponse {
    tables: Table[];
    meta: {
        totalItems: number;
        totalPages: number;
        page: number;
        size: number;
    };
}

export interface GetTablesQuery {
    page?: number;
    size?: number;
    restaurantId?: string;
}

