import path from 'path';
import { config } from 'dotenv';

const envPath = path.resolve(process.cwd(), '.env');
config({ path: envPath, override: true });

const requiredVariables = ['DATABASE_URL', 'JWT_SECRET'] as const;

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  jwtSecret: process.env.JWT_SECRET as string,
  tokenExpirationHours: Number(process.env.TOKEN_EXPIRATION_HOURS ?? 12),
};

