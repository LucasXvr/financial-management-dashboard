export interface ApiResponse<T> {
  data?: T;
  message?: string;
}

export interface LoginResponseData {
  userId?: string;
  email?: string;
  token?: string;
  accessToken?: string;
  roles?: string[];
  expiration?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export function extractToken(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const payload = body as Record<string, unknown>;

  const topLevelToken =
    readString(payload, 'token') ??
    readString(payload, 'accessToken') ??
    readString(payload, 'Token') ??
    readString(payload, 'AccessToken');

  if (topLevelToken) {
    return topLevelToken;
  }

  const nested = payload['data'] ?? payload['Data'];
  if (!nested || typeof nested !== 'object') {
    return null;
  }

  const nestedPayload = nested as Record<string, unknown>;

  return (
    readString(nestedPayload, 'token') ??
    readString(nestedPayload, 'accessToken') ??
    readString(nestedPayload, 'Token') ??
    readString(nestedPayload, 'AccessToken')
  );
}

export function extractApiMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') {
    return fallback;
  }

  const payload = body as Record<string, unknown>;
  const message = payload['message'] ?? payload['Message'];

  if (typeof message === 'string' && message.trim().length > 0) {
    return message;
  }

  return fallback;
}

function readString(
  payload: Record<string, unknown>,
  key: string
): string | null {
  const value = payload[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}
