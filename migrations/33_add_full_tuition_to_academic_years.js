/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Add full_tuition to academic_years
    const hasColumn = await knex.schema.hasColumn(
        'academic_years',
        'full_tuition'
    );
    if (!hasColumn) {
        await knex.schema.alterTable('academic_years', function (table) {
            table.decimal('full_tuition', 10, 2).notNullable().defaultTo(0);
        });
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    const hasColumn = await knex.schema.hasColumn(
        'academic_years',
        'full_tuition'
    );
    if (hasColumn) {
        await knex.schema.alterTable('academic_years', function (table) {
            table.dropColumn('full_tuition');
        });
    }
};
