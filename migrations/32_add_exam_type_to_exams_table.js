/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('exams', function (table) {
    table.enum('exam_type', ['exam', 'quiz']).notNullable().defaultTo('exam');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('exams', function (table) {
    table.dropColumn('exam_type');
  });
};


