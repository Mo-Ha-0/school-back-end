/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('semesters', function (table) {
    table.increments('id').primary();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table
      .integer('academic_year_id')
      .unsigned()
      .references('id')
      .inTable('academic_years')
      .onDelete('CASCADE');
    table.string('semester_name', 100).notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('semesters');
};
