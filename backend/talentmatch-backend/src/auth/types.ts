export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

export interface RequestUser {
  id: number;
  userId?: number;
  email: string;
  role: string;
  name?: string;
}
