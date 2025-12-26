// Tipos relacionados a organizações

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt: string;
  metadata?: string;
}

export interface OrganizationRole {
  id: string;
  organizationId: string;
  role: string;
  permission: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  inviterId: string;
  phone?: string;
  organizationName?: string;
  organizationSlug?: string;
  inviterEmail?: string;
  teamId?: string;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  userId?: string;
  logo?: string;
  metadata?: string;
  keepCurrentActiveOrganization?: boolean;
}

export interface UpdateOrganizationRequest {
  data: {
    name?: string;
    slug?: string;
    logo?: string;
    metadata?: string;
  };
  organizationId?: string;
}

export interface DeleteOrganizationRequest {
  organizationId: string;
}

export interface SetActiveOrganizationRequest {
  organizationId?: string;
  organizationSlug?: string;
}

export interface InviteMemberRequest {
  email: string;
  role: string;
  organizationId?: string;
  resend?: boolean;
  teamId: string;
}

export interface CancelInvitationRequest {
  invitationId: string;
}

export interface AcceptInvitationRequest {
  invitationId: string;
}

export interface RejectInvitationRequest {
  invitationId: string;
}

export interface GetInvitationRequest {
  id: string;
}

export interface RemoveMemberRequest {
  memberIdOrEmail: string;
  organizationId?: string;
}

export interface UpdateMemberRoleRequest {
  role: string | string[];
  memberId: string;
  organizationId?: string;
}

export interface LeaveOrganizationRequest {
  organizationId: string;
}

export interface CheckSlugRequest {
  slug: string;
}

export interface CreateRoleRequest {
  role: string;
  permission: string;
  organizationId?: string;
  additionalFields?: Record<string, unknown>;
}

export interface HasPermissionRequest {
  permissions: Record<string, unknown>;
  permission?: Record<string, unknown>;
}

export interface HasPermissionResponse {
  success: boolean;
  error?: string;
}
