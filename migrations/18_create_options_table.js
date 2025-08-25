/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('options', function (table) {
    table.increments('id').primary();
    table
      .integer('question_id')
      .unsigned()
      .references('id')
      .inTable('questions')
      .onDelete('CASCADE');
    table.text('text').notNullable();
    table.boolean('is_correct').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('options');
};
