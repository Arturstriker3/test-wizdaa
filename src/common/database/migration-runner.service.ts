import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import path from 'path';
import { PoolClient } from 'pg';
import { pathToFileURL } from 'url';
import { DatabaseService } from './database.service';

export type Migration = {
  name: string;
  up: (client: PoolClient) => Promise<void>;
  down?: (client: PoolClient) => Promise<void>;
};

type MigrationModule = {
  default?: unknown;
};

@Injectable()
export class MigrationRunnerService {
  private readonly logger = new Logger('MigrationRunner');

  constructor(private readonly databaseService: DatabaseService) {}

  async run(): Promise<void> {
    const pool = this.databaseService.getPool();
    const client = await pool.connect();
    try {
      await this.ensureMigrationsTable(client);
      const applied = await this.getAppliedMigrations(client);
      const migrations = await this.loadMigrations();
      const pending = migrations.filter(
        (migration) => !applied.has(migration.name),
      );

      if (pending.length === 0) {
        this.logger.log('No pending migrations');
        return;
      }

      for (const migration of pending) {
        this.logger.log(`Running migration: ${migration.name}`);
        await this.runMigration(client, migration.name, () =>
          migration.up(client),
        );
      }

      this.logger.log('Migrations completed');
    } finally {
      client.release();
    }
  }

  private async loadMigrations(): Promise<Migration[]> {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter(
        (file) => /^\d{14}-.*\.(ts|js)$/.test(file) && !file.endsWith('.d.ts'),
      )
      .sort();

    const migrations = await Promise.all(
      migrationFiles.map(async (file) => {
        const modulePath = path.join(migrationsDir, file);
        const importedModule = (await import(
          pathToFileURL(modulePath).href
        )) as unknown;
        const MigrationClass = this.getMigrationClass(importedModule, file);

        return new MigrationClass();
      }),
    );

    return migrations;
  }

  private getMigrationClass(
    importedModule: unknown,
    file: string,
  ): new () => Migration {
    const migrationClass = this.resolveMigrationClass(importedModule);
    if (!migrationClass) {
      throw new Error(`Invalid migration: ${file}`);
    }

    return migrationClass;
  }

  private resolveMigrationClass(value: unknown): (new () => Migration) | null {
    if (typeof value === 'function') {
      return value as new () => Migration;
    }

    if (!value || typeof value !== 'object') {
      return null;
    }

    const record = value as Record<string, unknown>;
    if (typeof record.default === 'function') {
      return record.default as new () => Migration;
    }

    const nested = record.default as MigrationModule | undefined;
    if (nested && typeof nested.default === 'function') {
      return nested.default as new () => Migration;
    }

    return null;
  }

  private async ensureMigrationsTable(client: PoolClient): Promise<void> {
    await client.query(`
      create table if not exists migrations (
        id serial primary key,
        name text not null unique,
        executed_at timestamptz not null default now()
      )
    `);
  }

  private async getAppliedMigrations(client: PoolClient): Promise<Set<string>> {
    const result = await client.query<{ name: string }>(
      'select name from migrations',
    );
    return new Set(result.rows.map((row) => row.name));
  }

  private async runMigration(
    client: PoolClient,
    name: string,
    run: () => Promise<void>,
  ): Promise<void> {
    await client.query('begin');
    try {
      await run();
      await client.query('insert into migrations (name) values ($1)', [name]);
      await client.query('commit');
    } catch (error) {
      await client.query('rollback');
      throw error;
    }
  }
}
