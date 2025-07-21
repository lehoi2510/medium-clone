import { Request } from 'express';

export interface AuthenticatedUser {
  id: number;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
