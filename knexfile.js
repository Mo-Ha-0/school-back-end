require('dotenv').config();
module.exports = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST,
            port: 5432,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        },
    },
    production: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST,
            port: 5432,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            ssl: false,
        },
    },

    migrations: {
        directory: './migrations',
        tableName: 'knex_migrations',
    },
};
