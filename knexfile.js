require('dotenv').config();
module.exports = {
    development: {
        client: 'pg',
        connection: {
            host: '127.0.0.1',
            port: 5432,
            user: 'postgres',
            password: process.env.DB_PASS || '',
            database: 'school_db_3',
        },
    },

    migrations: {
        directory: './migrations',
        tableName: 'knex_migrations',
    },
};
