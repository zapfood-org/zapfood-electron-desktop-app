// Tipos para integração com produtos retornados pela API

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    restaurantId: string;
    optionGroupIds?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ProductsResponse {
    products: Product[];
    meta: {
        totalItems: number;
        totalPages: number;
        page: number;
        size: number;
    };
}
