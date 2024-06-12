import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('description');
    table.timestamp('meal_date_time').notNullable().defaultTo(knex.fn.now());
    table.boolean('is_included_on_diet').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals');
}
