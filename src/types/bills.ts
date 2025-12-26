// Tipos relacionados a comandas

export interface Bill {
    id: string;
    displayId: number;
    restaurantId: string;
    available: boolean;
    active: boolean;
    createdAt: string | Date | number;
    updatedAt: string | Date | number;
}

export interface CreateBillRequest {
    displayId: number;
}

export interface CreateBillsRangeRequest {
    range: {
        startsIn: number;
        endsIn: number;
    };
}

export interface DeleteBillsRangeRequest {
    range: {
        startsIn: number;
        endsIn: number;
    };
}

export interface UpdateBillRequest {
    name?: string;
    tableIds?: string[];
}

export interface BillsResponse {
    bills: Bill[];
    meta: {
        totalItems: number;
        totalPages: number;
        page: number;
        size: number;
    };
}

export interface CreateBillsRangeResponse {
    bills: Bill[];
}

export interface GetBillsQuery {
    page?: number;
    size?: number;
    restaurantId?: string;
    available?: string;
}

