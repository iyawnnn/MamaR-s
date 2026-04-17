import { JwtPayload } from 'jsonwebtoken';
import { IUser } from './index';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_URI: string;
      JWT_SECRET: string;
      PORT?: string;
      NODE_ENV?: 'development' | 'production' | 'test';
    }
  }

  namespace Express {
    interface Request {
      user?: string | JwtPayload | any;
    }
  }
}

export {};
