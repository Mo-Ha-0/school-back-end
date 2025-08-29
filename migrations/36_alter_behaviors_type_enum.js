// 36_alter_behaviors_type_enum.js
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .alterTable('behaviors', function (table) {
            table.dropColumn('type');
        })
        .then(() => {
            return knex.schema.alterTable('behaviors', function (table) {
                table
                    .enum('type', [
                        'Exam Issues',
                        'Attendance Problems',
                        'Academic Integrity',
                        'Behavior Concerns',
                        'Social Skills',
                        'Work Habits',
                        'Practical Skills',
                        'Good Behavior',
                    ])
                    .nullable();
            });
        });
};

exports.down = function (knex) {
    return knex.schema
        .alterTable('behaviors', function (table) {
            table.dropColumn('type');
        })
        .then(() => {
            return knex.schema.alterTable('behaviors', function (table) {
                table.enum('type', ['bad', 'good']).notNullable();
            });
        });
};
