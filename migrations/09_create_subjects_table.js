/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('subjects', function (table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('resources').nullable();
    // table
    //   .integer('teacher_id')
    //   .unsigned()
    //   .references('id')
    //   .inTable('teachers')
    //   .onDelete('SET NULL');
    table
      .integer('curriculum_id')
      .unsigned()
      .references('id')
      .inTable('curriculums')
      .onDelete('SET NULL');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('subjects');
};
