// Tipos relacionados a avaliações

export interface Rating {
    id: string;
    userId: string;
    restaurantId: string;
    rating: number;
    comment?: string;
}

export interface CreateRatingRequest {
    userId: string;
    restaurantId: string;
    rating: number;
    comment?: string;
}

export interface UpdateRatingRequest {
    rating?: number;
    comment?: string;
}

export interface RatingsResponse {
    ratings: Rating[];
    meta: {
        totalItems: number;
        totalPages: number;
        page: number;
        size: number;
    };
}

export interface GetRatingsQuery {
    page?: number;
    size?: number;
}

