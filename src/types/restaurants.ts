// Tipos relacionados a restaurantes

export interface Restaurant {
    id: string;
    name: string;
    phone?: string;
    createdAt: string | Date | number;
    updatedAt: string | Date | number;
}

export interface CreateRestaurantRequest {
    name: string;
    phone: string;
}

export interface UpdateRestaurantRequest {
    name?: string;
    phone?: string;
}

export interface RestaurantsResponse {
    restaurants: Restaurant[];
    meta: {
        totalItems: number;
        totalPages: number;
        page: number;
        size: number;
    };
}

export interface AddMemberToRestaurantRequest {
    email: string;
    role: "OWNER" | "MANAGER" | "EMPLOYEE";
}

export interface RemoveMemberFromRestaurantRequest {
    email: string;
}

