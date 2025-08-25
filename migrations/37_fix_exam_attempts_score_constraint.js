// 37_fix_exam_attempts_score_constraint.js
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.raw(`
        ALTER TABLE exam_attempts DROP CONSTRAINT IF EXISTS score;
        ALTER TABLE exam_attempts ADD CONSTRAINT score_check CHECK (score >= 0);
    `);
};

exports.down = function (knex) {
    return knex.raw(`
        ALTER TABLE exam_attempts DROP CONSTRAINT IF EXISTS score_check;
        ALTER TABLE exam_attempts ADD CONSTRAINT score CHECK (score >= 0);
    `);
};
