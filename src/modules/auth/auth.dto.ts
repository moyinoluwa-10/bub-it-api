export interface SignupRequest {
  email: string;
  password: string;
}

export interface AuthUserPayload {
  userId: string;
  role: string;
  email: string;
}

export interface SignupResponse {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUserPayload;
  refreshToken: string;
}

export interface VerifyEmailRequest {
  email: string;
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  password: string;
  token: string;
}
