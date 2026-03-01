import { promises as fs } from 'fs';
import path from 'path';

const formatTimestamp = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('');
};

const toKebabCase = (value: string): string =>
  value
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

const createMigration = async (): Promise<void> => {
  const rawName = process.argv[2];
  if (!rawName) {
    throw new Error('Migration name is required.');
  }

  const migrationSlug = toKebabCase(rawName);
  if (!migrationSlug) {
    throw new Error('Migration name is invalid.');
  }

  const timestamp = formatTimestamp(new Date());
  const fileBase = `${timestamp}-${migrationSlug}`;
  const className = `Migration${timestamp}`;
  const migrationsDir = path.join(__dirname, 'migrations');
  const filePath = path.join(migrationsDir, `${fileBase}.ts`);

  const template = `import { PoolClient } from 'pg';
import type { Migration } from '../migration-runner.service';

export default class ${className} implements Migration {
  name = '${fileBase}';

  async up(client: PoolClient): Promise<void> {
    await client.query('select 1');
  }

  async down(client: PoolClient): Promise<void> {
    await client.query('select 1');
  }
}
`;

  await fs.writeFile(filePath, template);
  process.stdout.write(`Migration criada: ${fileBase}\n`);
};

createMigration().catch((error: Error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
