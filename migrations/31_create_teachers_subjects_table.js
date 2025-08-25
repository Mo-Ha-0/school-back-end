/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('teachers_subjects', function (table) {
        table.increments('id').primary();
        table.integer('teacher_id')
          .unsigned()
          .notNullable()
          .references('id')
          .inTable('teachers')
          .onDelete('CASCADE');

          table.integer('subject_id')
          .unsigned()
          .notNullable()
          .references('id')
          .inTable('subjects')
          .onDelete('CASCADE');
          table.unique([ 'teacher_id', 'subject_id']);
      });
   
      
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('teachers_subjects');
};
