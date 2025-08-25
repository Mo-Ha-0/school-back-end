/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('archives', function (table) {
    table.increments('id').primary();
    table
      .integer('student_id')
      .unsigned()
      .references('id')
      .inTable('students')
      .onDelete('SET NULL');
    table
      .integer('academic_year_id')
      .unsigned()
      .references('id')
      .inTable('academic_years')
      .onDelete('SET NULL');
    table
      .decimal('remaining_tuition', 10, 2)
      .unsigned()
      .notNullable()
      .defaultTo(0);
    table.unique(['student_id', 'academic_year_id']);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('archives');
};
