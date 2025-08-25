/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('exam_attempts', function (table) {
    table.increments('id').primary();
    table
      .integer('exam_id')
      .unsigned()
      .references('id')
      .inTable('exams')
      .onDelete('CASCADE');
    table
      .integer('student_id')
      .unsigned()
      .references('id')
      .inTable('students')
      .onDelete('CASCADE');
    table.integer('score').unsigned().nullable().checkPositive();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('exam_attempts');
};
