import type { Role } from './domain.js';

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
  memberId?: number | null;
}

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
