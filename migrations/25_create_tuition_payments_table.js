// 25_create_tuition_payments_table.js
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('tuition_payments', function (table) {
    table.increments('id').primary();
    table.decimal('amount', 10, 2).notNullable();
    table.date('payment_date').notNullable();
    table.enum('payment_method', ['cash', 'bank_transfer']).notNullable();
    table
      .integer('student_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('students')
      .onDelete('CASCADE');
    table
      .integer('verified_by')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table
      .integer('archive_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('archives')
      .onDelete('SET NULL');
    table.index('student_id');
    table.index('payment_date');
    table.index('payment_method');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('tuition_payments');
};
