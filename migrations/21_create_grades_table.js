/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('grades', function (table) {
    table.increments('id').primary();
    table
      .integer('archive_id')
      .unsigned()
      .references('id')
      .inTable('archives')
      .onDelete('CASCADE');
    table
      .integer('subject_id')
      .unsigned()
      .references('id')
      .inTable('subjects')
      .onDelete('CASCADE');
      table
      .integer('semester_id')
      .unsigned()
      .references('id')
      .inTable('semesters')
      .onDelete('CASCADE');
    table.decimal('min_score', 5, 2).unsigned().notNullable();
    table.decimal('max_score', 5, 2).unsigned().notNullable();
    table.decimal('grade', 5, 2).unsigned().notNullable();
    table
      .enum('type', ['worksheet', 'exam', 'quiz', 'assignment'])
      .notNullable();
    
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('grades');
};
