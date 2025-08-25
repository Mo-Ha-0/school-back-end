/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('exam_question', function (table) {
    table.increments('id').primary();
    table
      .integer('exam_id')
      .unsigned()
      .references('id')
      .inTable('exams')
      .onDelete('CASCADE');
    table
      .integer('question_id')
      .unsigned()
      .references('id')
      .inTable('questions')
      .onDelete('CASCADE');
    table.integer('mark').unsigned().notNullable();
    table.unique(['exam_id', 'question_id'], 'exams_questions_unique');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('exam_question');
};
