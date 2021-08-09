module.exports.up = (knex) => {
  return knex.schema.createTable("workflows", (table) => {
    table.increments("workflow_id");
    table.integer("facebook_page_id");
    table.integer("twitter_id");
    table.string("message");
    table.integer("user_id").references("user_id").inTable("users");
    table.boolean("send_mail").defaultTo(false);

    table.timestamps(true, true);
  });
};

module.exports.down = (knex) => {
  return knex.schema.dropTableIfExists("workflows");
};
