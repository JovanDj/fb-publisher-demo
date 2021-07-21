module.exports.up = (knex) => {
  return knex.schema.createTable("subscriptions", (table) => {
    table.increments("subscription_id");
    table.integer("facebook_page_id");
    table.integer("twitter_id");
    table.integer("user_id").references("user_id").inTable("users");
    table.string("feed_url");
    table.boolean("send_mail").defaultTo(false);

    table.timestamps(true, true);
  });
};

module.exports.down = (knex) => {
  return knex.schema.dropTableIfExists("subscriptions");
};
