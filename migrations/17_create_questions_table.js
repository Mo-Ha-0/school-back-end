/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('questions', function (table) {
    table.increments('id').primary();
    table
      .integer('subject_id')
      .unsigned()
      .references('id')
      .inTable('subjects')
      .onDelete('CASCADE');
    table.text('question_text').notNullable();
    table.enum('type', ['mcq', 'true_false']).notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('questions');
};
