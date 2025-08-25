/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('students', function (table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned();
    table.integer('class_id').unsigned();
    table.integer('curriculum_id').unsigned();
    table.enum('grade_level', [9, 10, 11, 12]).notNullable();

    table
      .foreign('curriculum_id')
      .references('curriculums.id')
      .onDelete('SET NULL');
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.foreign('class_id').references('classes.id').onDelete('RESTRICT');

    table.timestamps(true, true); // created_at and updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('students');
};
