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
        connection:
            'postgresql://mohammad:MqdoLaFOIDjLJCxwBMJ3D90D4wWGxkLw@dpg-d2m5ndf5r7bs73ecdru0-a/school_n38e?sslmode=require',
    },

    migrations: {
        directory: './migrations',
        tableName: 'knex_migrations',
    },
};
