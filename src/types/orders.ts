// Tipos relacionados a pedidos

export type OrderStatus = "PENDING" | "PREPARING" | "DELIVERING" | "COMPLETED" | "CANCELED";

export type OrderType = "DELIVERY" | "PICKUP" | "DINE_IN";

export interface OrderItem {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    total: number;
    observation?: string | null;
    selectedOptions: Record<string, unknown>;
}

export interface Order {
    id: string;
    displayId: number;
    status: OrderStatus;
    type: OrderType;
    customerName: string;
    customerPhone?: string | null;
    deliveryAddress?: string | null;
    observation?: string | null;
    total: number;
    estimatedTime?: number | null;
    createdAt: string | Date | number;
    updatedAt: string | Date | number;
    acceptedAt?: string | Date | number | null;
    preparedAt?: string | Date | number | null;
    dispatchedAt?: string | Date | number | null;
    completedAt?: string | Date | number | null;
    canceledAt?: string | Date | number | null;
    restaurantId: string;
    items: OrderItem[];
    tableIds?: string[];
    billId?: string;
}

export interface CreateOrderRequest {
    type: OrderType;
    customerName: string;
    customerPhone?: string;
    deliveryAddress?: string;
    tableIds?: string[];
    billId?: string;
    observation?: string;
    status: OrderStatus;
    items: {
        productId: string;
        quantity: number;
        observation?: string;
        selectedOptions?: Record<string, unknown>;
    }[];
    estimatedTime?: number;
}

export interface UpdateOrderRequest {
    type?: OrderType;
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    tableIds?: string[];
    billId?: string | null;
    observation?: string;
    status?: OrderStatus;
    estimatedTime?: number;
    items?: {
        productId: string;
        quantity: number;
        observation?: string;
        selectedOptions?: Record<string, unknown>;
    }[];
}

export interface OrdersResponse {
    orders: Order[];
    meta: {
        totalItems: number;
        totalPages: number;
        page: number;
        size: number;
    };
}

export interface GetOrdersQuery {
    page?: number;
    size?: number;
    customerName?: string;
    type?: string;
    displayId?: number;
    status?: string;
}

