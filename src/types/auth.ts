// Tipos relacionados à autenticação e usuários

export interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string;
    createdAt: string;
    updatedAt: string;
    sub?: string;
}

export interface Session {
    id: string;
    expiresAt: string;
    token: string;
    createdAt: string;
    updatedAt: string;
    ipAddress?: string;
    userAgent?: string;
    userId: string;
    activeOrganizationId?: string;
}

export interface Account {
    id: string;
    accountId: string;
    providerId: string;
    userId: string;
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    accessTokenExpiresAt?: string;
    refreshTokenExpiresAt?: string;
    scope?: string;
    password?: string;
    createdAt: string;
    updatedAt: string;
    scopes?: string[];
}

export interface Verification {
    id: string;
    identifier: string;
    value: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface SignUpRequest {
    name: string;
    email: string;
    password: string;
    image?: string;
    callbackURL?: string;
    rememberMe?: boolean;
}

export interface SignInRequest {
    email: string;
    password: string;
    callbackURL?: string;
    rememberMe?: string;
}

export interface SignInResponse {
    redirect: false;
    token: string;
    user: User;
    url?: string;
}

export interface GetSessionResponse {
    session: Session;
    user: User;
}

export interface ChangePasswordRequest {
    newPassword: string;
    currentPassword: string;
    revokeOtherSessions?: boolean;
}

export interface ChangeEmailRequest {
    newEmail: string;
    callbackURL?: string;
}

export interface ResetPasswordRequest {
    newPassword: string;
    token?: string;
}

export interface RequestPasswordResetRequest {
    email: string;
    redirectTo?: string;
}

export interface UpdateUserRequest {
    name?: string;
    image?: string;
}

export interface DeleteUserRequest {
    callbackURL?: string;
    password?: string;
    token?: string;
}

export interface SocialSignInRequest {
    provider: string;
    callbackURL?: string;
    newUserCallbackURL?: string;
    errorCallbackURL?: string;
    disableRedirect?: boolean;
    idToken?: {
        token: string;
        nonce?: string;
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: number;
    };
    scopes?: string[];
    requestSignUp?: boolean;
    loginHint?: string;
    additionalData?: string;
}

export interface LinkSocialRequest {
    provider: string;
    callbackURL?: string;
    idToken?: {
        token: string;
        nonce?: string;
        accessToken?: string;
        refreshToken?: string;
        scopes?: string[];
    };
    requestSignUp?: boolean;
    scopes?: string[];
    errorCallbackURL?: string;
    disableRedirect?: boolean;
    additionalData?: string;
}

export interface RefreshTokenRequest {
    providerId: string;
    accountId?: string;
    userId?: string;
}

export interface RefreshTokenResponse {
    tokenType: string;
    idToken: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string;
    refreshTokenExpiresAt: string;
}

export interface UnlinkAccountRequest {
    providerId: string;
    accountId?: string;
}

export interface RevokeSessionRequest {
    token: string;
}

