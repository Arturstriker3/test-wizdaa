import { PoolClient } from 'pg';
import type { Migration } from '../migration-runner.service';

export default class Migration20260301025709 implements Migration {
  name = '20260301025709-products';

  async up(client: PoolClient): Promise<void> {
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(120) NOT NULL,
        description text NULL,
        price numeric(12, 2) NOT NULL,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
  }

  async down(client: PoolClient): Promise<void> {
    await client.query('DROP TABLE IF EXISTS products');
  }
}
