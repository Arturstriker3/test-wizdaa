import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export type DatabaseConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

let pool: Pool | null = null;

export const getDatabaseConfig = (config: ConfigService): DatabaseConfig => ({
  host: config.get<string>('DATABASE_HOST', 'localhost'),
  port: Number(config.get('DATABASE_PORT', 5432)),
  user: config.get<string>('DATABASE_USER', 'postgres'),
  password: config.get<string>('DATABASE_PASSWORD', 'postgres'),
  database: config.get<string>('DATABASE_NAME', 'postgres'),
});

export const getDatabasePool = (config: ConfigService): Pool => {
  if (pool) {
    return pool;
  }

  const databaseConfig = getDatabaseConfig(config);
  pool = new Pool(databaseConfig);
  return pool;
};
