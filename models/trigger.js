const { Model } = require("objection");

class Trigger extends Model {
  static get tableName() {
    return "triggers";
  }

  static get idColumn() {
    return "triggerId";
  }

  static get relationMappings() {
    const Workflow = require("./workflow");

    return {
      workflows: {
        relation: Model.ManyToManyRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one. We use a model
        // subclass constructor `Animal` here.
        modelClass: Workflow,
        join: {
          from: "triggers.triggerId",
          through: {
            from: "triggersWorkflows.triggerId",
            to: "triggersWorkflows.workflowId",
          },
          to: "workflows.workflowId",
        },
      },
    };
  }
}

module.exports = Trigger;
