require('dotenv').config();
module.exports = {
    development: {
        client: 'pg',
        connection: {
            host: 'dpg-d2m5ndf5r7bs73ecdru0-a.oregon-postgres.render.com',
            port: 5432,
            user: 'mohammad',
            password: process.env.DB_PASS,
            database: 'school_n38e',
        },
    },
    production: {
        client: 'pg',
        connection: {
            host:
                process.env.DB_HOST ||
                'dpg-d2m5ndf5r7bs73ecdru0-a.oregon-postgres.render.com',
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER || 'mohammad',
            password: process.env.DB_PASS,
            database: process.env.DB_NAME || 'school_n38e',
            ssl: { rejectUnauthorized: false },
        },
    },

    migrations: {
        directory: './migrations',
        tableName: 'knex_migrations',
    },
};
