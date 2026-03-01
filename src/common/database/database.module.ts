import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { MigrationRunnerService } from './migration-runner.service';

@Module({
  imports: [ConfigModule],
  providers: [DatabaseService, MigrationRunnerService],
  exports: [DatabaseService, MigrationRunnerService],
})
export class DatabaseModule {}
