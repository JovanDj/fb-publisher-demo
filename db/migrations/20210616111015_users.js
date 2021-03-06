module.exports.up = (knex) => {
  return knex.schema.createTable("users", (table) => {
    table.increments("user_id");
    table.string("email").unique();
    table.string("password");
    table.integer("facebook_id").nullable();
    table.integer("twitter_id").nullable();

    table.string("first_name").default("");
    table.string("last_name").default("");

    table.timestamps(true, true);
  });
};

module.exports.down = (knex) => {
  return knex.schema.dropTableIfExists("users");
};
