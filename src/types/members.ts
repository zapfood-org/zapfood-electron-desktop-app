// Tipos relacionados a membros de restaurantes

export type MemberRole = "OWNER" | "MANAGER" | "EMPLOYEE";

export interface RestaurantMember {
  id: string;
  role: MemberRole;
  restaurantId: string;
  userId: string;
  createdAt: string | Date | number;
  updatedAt: string | Date | number;
}

export interface CreateMemberRequest {
  role: MemberRole;
  restaurantId: string;
  userId: string;
}

export interface UpdateMemberRequest {
  role?: MemberRole;
  restaurantId?: string;
  userId?: string;
}

export interface MembersResponse {
  members: RestaurantMember[];
  meta: {
    totalItems: number;
    totalPages: number;
    page: number;
    size: number;
  };
}

export interface GetMembersQuery {
  page?: number;
  size?: number;
}
