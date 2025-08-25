/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Ensure extension for uuid function (used to derive default short id)
    await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Add a 10-char identifier column, unique and not null, with default
    await knex.schema.alterTable('exams', function (table) {
        table.string('uuid', 10).notNullable().unique();
    });

    // Backfill existing rows with 10-char identifiers
    await knex.raw(`
    UPDATE exams
    SET uuid = SUBSTRING(REPLACE(uuid_generate_v4()::text, '-', '') FROM 1 FOR 10)
    WHERE uuid IS NULL OR uuid = '';
  `);

    // Add default for new inserts
    await knex.raw(`
    ALTER TABLE exams
    ALTER COLUMN uuid SET DEFAULT SUBSTRING(REPLACE(uuid_generate_v4()::text, '-', '') FROM 1 FOR 10);
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.alterTable('exams', function (table) {
        table.dropColumn('uuid');
    });
};
