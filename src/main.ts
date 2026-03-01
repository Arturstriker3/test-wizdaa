import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getDatabasePool } from './config/database.config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const databasePool = getDatabasePool(configService);
  await databasePool.query('select 1');
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`API running on http://localhost:${port}`);
}
void bootstrap();
