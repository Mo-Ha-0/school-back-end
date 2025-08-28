/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('attendance_teachers', function (table) {
        table.increments('id').primary();
        table
            .integer('teacher_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('teachers')
            .onDelete('CASCADE');
        table
            .integer('created_by')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('CASCADE');
        table.date('date').notNullable();
        table.enum('status', ['present', 'absent', 'late']).notNullable();
        table.unique(['teacher_id', 'date']);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('attendance_teachers');
};
