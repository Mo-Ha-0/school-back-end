/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('schedules', function (table) {
    table.increments('id').primary();
    table
      .integer('class_id')
      .unsigned()
      .references('id')
      .inTable('classes')
      .onDelete('RESTRICT');
    table
      .integer('subject_id')
      .unsigned()
      .references('id')
      .inTable('subjects')
      .onDelete('RESTRICT');
    table
      .integer('day_id')
      .unsigned()
      .references('id')
      .inTable('days')
      .onDelete('CASCADE');
    table
      .integer('period_id')
      .unsigned()
      .references('id')
      .inTable('periods')
      .onDelete('CASCADE');
      table
      .integer('teacher_id')
      .unsigned()
      .references('id')
      .inTable('teachers')
      .onDelete('CASCADE');
    // table.unique(['subject_id', 'day_id', 'period_id']);
    table.unique(['class_id', 'day_id', 'period_id']);
    table.unique(['teacher_id','class_id', 'day_id', 'period_id']);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('schedules');
};
