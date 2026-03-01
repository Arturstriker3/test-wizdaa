import { PoolClient } from 'pg';
import type { Migration } from '../migration-runner.service';

export default class Migration20260301023902 implements Migration {
  name = '20260301023902-nome-da-migration';

  async up(client: PoolClient): Promise<void> {
    await client.query('select 1');
  }

  async down(client: PoolClient): Promise<void> {
    await client.query('select 1');
  }
}
