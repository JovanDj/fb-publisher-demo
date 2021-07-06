require("dotenv").config();

// Update with your config settings.
const { POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, DB_HOST } = process.env;
const { knexSnakeCaseMappers } = require("objection");

module.exports = {
  development: {
    client: "sqlite3",
    useNullAsDefault: true,
    connection: {
      filename: "./db.sqlite",
    },
    migrations: {
      directory: "./db/migrations",
    },
    seeds: {
      directory: "./db/seeds",
    },

    ...knexSnakeCaseMappers(),
  },

  production: {
    client: "sqlite3",
    useNullAsDefault: true,
    connection: {
      filename: "./db.sqlite",
    },
    migrations: {
      directory: "./db/migrations",
    },
    seeds: {
      directory: "./db/seeds",
    },

    ...knexSnakeCaseMappers(),
  },
};
