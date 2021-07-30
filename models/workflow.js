const { Model } = require("objection");

class Workflow extends Model {
  static get tableName() {
    return "workflows";
  }

  static get idColumn() {
    return "workflowId";
  }

  static get relationMappings() {
    const User = require("./user");
    const Trigger = require("./trigger");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one. We use a model
        // subclass constructor `Animal` here.
        modelClass: User,
        join: {
          from: "workflows.userId",
          to: "users.userId",
        },
      },
      triggers: {
        relation: Model.ManyToManyRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one. We use a model
        // subclass constructor `Animal` here.
        modelClass: Trigger,
        join: {
          from: "workflows.workflowId",
          through: {
            from: "triggersWorkflows.workflowId",
            to: "triggersWorkflows.triggerId",
          },
          to: "triggers.triggerId",
        },
      },
    };
  }
}

module.exports = Workflow;
