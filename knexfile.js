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
            host: 'dpg-d2m5ndf5r7bs73ecdru0-a', // Internal hostname
            port: 5432,
            user: 'mohammad',
            password: 'MqdoLaFOIDjLJCxwBMJ3D90D4wWGxkLw',
            database: 'school_n38e',
            ssl: false, // No SSL needed for internal connections
        },
    },

    migrations: {
        directory: './migrations',
        tableName: 'knex_migrations',
    },
};
