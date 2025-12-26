// Tipos relacionados a usuários

export interface ApiUser {
  id: string;
  sub?: string;
  name: string;
  email: string;
  createdAt: string | Date | number;
  updatedAt: string | Date | number;
}

export interface CreateUserRequest {
  sub: string;
  name: string;
  email: string;
}

export interface UpdateApiUserRequest {
  sub?: string;
  name?: string;
  email?: string;
}

export interface UsersResponse {
  users: ApiUser[];
  meta: {
    totalItems: number;
    totalPages: number;
    page: number;
    size: number;
  };
}

export interface GetUsersQuery {
  page?: number | string;
  size?: number | string;
}
