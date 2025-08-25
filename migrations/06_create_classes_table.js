/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('classes', function (table) {
    table.increments('id').primary();
    table.string('class_name').notNullable();
    table.integer('floor_number').notNullable();
    table.enum('level_grade', ['9', '10', '11', '12']).notNullable();

    table.timestamps(true, true); // created_at and updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('classes');
};
