/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('answers', function (table) {
      table.increments('id').primary();
      table
        .integer('question_id')
        .unsigned()
        .references('id')
        .inTable('questions')
        .onDelete('CASCADE');
      table
        .integer('option_id')
        .unsigned()
        .references('id')
        .inTable('options')
        .onDelete('CASCADE');
      table
        .integer('exam_attempt_id')
        .unsigned()
        .references('id')
        .inTable('exam_attempts')
        .onDelete('CASCADE');
      table.integer('mark_awarded').unsigned().nullable();
      table.timestamps(true, true);
    })
    .then(() =>
      knex.raw(
        'ALTER TABLE answers ADD CONSTRAINT answers_mark_awarded_check CHECK (mark_awarded >= 0)'
      )
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('answers');
};
