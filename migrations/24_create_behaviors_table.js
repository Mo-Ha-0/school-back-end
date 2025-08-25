// 24_create_behaviors_table.js
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('behaviors', function (table) {
        table.increments('id').primary();
        table
            .integer('student_id')
            .unsigned()
            .references('id')
            .inTable('students')
            .onDelete('CASCADE');
        table.text('description').notNullable();
        table.date('date').notNullable();
        table.enum('type', ['bad', 'good']).notNullable();
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('behaviors');
};
