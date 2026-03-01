import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './common/database/database.service';
import { MigrationRunnerService } from './common/database/migration-runner.service';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const databaseService = app.get(DatabaseService);
  const migrationsService = app.get(MigrationRunnerService);
  await databaseService.query('select 1');
  const shouldRunMigrations = ['true', '1', 'yes'].includes(
    String(configService.get('RUN_MIGRATIONS', 'false')).toLowerCase(),
  );
  if (shouldRunMigrations) {
    await migrationsService.run();
  }
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`API running on http://localhost:${port}`);
}
void bootstrap();
