/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('days', function (table) {
    table.increments('id').primary();
    table
      .enum('name', ['sunday', 'monday', 'tuesday', 'wedenesday', 'thursday'])
      .notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('days');
};
