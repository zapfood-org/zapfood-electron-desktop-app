// Tipos relacionados a endereços

export interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
  restaurantId?: string;
  userId: string;
  createdAt: string | Date | number;
  updatedAt: string | Date | number;
}

export interface CreateAddressRequest {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
  restaurantId: string;
  userId: string;
}

export interface UpdateAddressRequest {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  restaurantId?: string;
}

export interface AddressesResponse {
  addresses: Address[];
  meta: {
    totalItems: number;
    totalPages: number;
    page: number;
    size: number;
  };
}

export interface GetAddressesQuery {
  page?: number;
  size?: number;
}
