import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/autoflow',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtExpiresIn: '7d',
  bcryptRounds: 10,
} as const;
