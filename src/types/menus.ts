// Tipos relacionados a menus

import type { Product } from "./products";

export interface Menu {
    id: string;
    name: string;
    description?: string | null;
    restaurantId: string;
    productIds: string[];
    products?: Product[];
    createdAt: string | Date | number;
    updatedAt: string | Date | number;
}

export interface CreateMenuRequest {
    name: string;
    description?: string;
    restaurantId: string;
    productIds?: string[];
}

export interface UpdateMenuRequest {
    name?: string;
    description?: string;
    productIds?: string[];
}

export interface MenusResponse {
    menus: Menu[];
    meta: {
        totalItems: number;
        totalPages: number;
        page: number;
        size: number;
    };
}

export interface GetMenusQuery {
    page?: number;
    size?: number;
    restaurantId?: string;
}

