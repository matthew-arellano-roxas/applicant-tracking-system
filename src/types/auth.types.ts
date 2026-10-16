export interface AuthResult {
  userId: string;
}

export interface TokenPayload {
  sub: string;
  role: string;
}
