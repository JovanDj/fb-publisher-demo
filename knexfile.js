require("dotenv").config();

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
