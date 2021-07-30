module.exports.up = (knex) => {
  return knex.schema.createTable("triggers", (table) => {
    table.increments("trigger_id");
    table.string("name").unique();

    table.timestamps(true, true);
  });
};

module.exports.down = (knex) => {
  return knex.schema.dropTableIfExists("triggers");
};
