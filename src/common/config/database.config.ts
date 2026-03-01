import { ConfigService } from '@nestjs/config';
export type DatabaseConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

export const getDatabaseConfig = (config: ConfigService): DatabaseConfig => ({
  host: config.get<string>('DATABASE_HOST', 'localhost'),
  port: Number(config.get('DATABASE_PORT', 5432)),
  user: config.get<string>('DATABASE_USER', 'postgres'),
  password: config.get<string>('DATABASE_PASSWORD', 'postgres'),
  database: config.get<string>('DATABASE_NAME', 'postgres'),
});
