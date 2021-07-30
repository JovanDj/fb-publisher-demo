module.exports.up = (knex) => {
  return knex.schema.createTable("triggers_workflows", (table) => {
    table.integer("workflow_id").references("workflow_id").inTable("workflows");
    table.integer("trigger_id").references("trigger_id").inTable("triggers");

    table.primary(["workflow_id", "trigger_id"]);

    table.timestamps(true, true);
  });
};

module.exports.down = (knex) => {
  return knex.schema.dropTableIfExists("triggers_workflows");
};
