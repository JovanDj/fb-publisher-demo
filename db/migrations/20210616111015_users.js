module.exports.up = (knex) => {
  return knex.schema.createTable("users", (table) => {
    table.increments("user_id");
    table.string("email").notNullable().unique().index();
    table.string("password").notNullable();

    table.timestamps(true, true);
  });
};

module.exports.down = (knex) => {
  return knex.schema.dropTableIfExists("users");
};
