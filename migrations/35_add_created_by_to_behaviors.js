/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const hasColumn = await knex.schema.hasColumn('behaviors', 'created_by');
    if (!hasColumn) {
        await knex.schema.alterTable('behaviors', function (table) {
            table
                .integer('created_by')
                .unsigned()
                .references('id')
                .inTable('users')
                .onDelete('SET NULL');
        });
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    const hasColumn = await knex.schema.hasColumn('behaviors', 'created_by');
    if (hasColumn) {
        await knex.schema.alterTable('behaviors', function (table) {
            table.dropColumn('created_by');
        });
    }
};
