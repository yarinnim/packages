import type { Knex } from 'knex';

type Table = {
  app?: string;
  appKey?: string;
};

const defTable = {
  app: 'integrated_app',
  appKey: 'integrated_app_key',
};

export async function up(knex: Knex, tableProps: Table = {}) {
  const { app = defTable.app, appKey = defTable.appKey } = tableProps;
  return knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    .then(() => knex.schema.createTable(app, (table) => {
      table.increments().primary();
      table.uuid('uuid').unique().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name', 255).notNullable();
      table.string('secret_key', 32).notNullable().defaultTo(knex.raw('md5(uuid_generate_v4()::text)'));
      table.jsonb('config').defaultTo({});
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').nullable();
      table.timestamp('deleted_at').nullable();
    }))
    .then(() => knex.schema.createTable(appKey, (table) => {
      table.increments().primary();
      table.integer('app_id').references('id').inTable(app).notNullable();
      table.text('private_key').notNullable();
      table.text('public_key').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('deleted_at').nullable();
    }));
}

export async function down(knex: Knex, table: Table = {}) {
  const { app = defTable.app, appKey = defTable.appKey } = table;
  return knex.schema.dropTable(appKey)
    .then(() => knex.schema.dropTable(app));
}
