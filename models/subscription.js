const { Model } = require("objection");

class Subscription extends Model {
  static get tableName() {
    return "subscriptions";
  }

  static get idColumn() {
    return "subscriptionId";
  }

  static get relationMappings() {
    const User = require("./user");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one. We use a model
        // subclass constructor `Animal` here.
        modelClass: User,
        join: {
          from: "subscriptions.userId",
          to: "users.userId",
        },
      },
      members: {
        relation: Model.ManyToManyRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one. We use a model
        // subclass constructor `Animal` here.
        modelClass: Subscription,
        join: {
          from: "users.userId",
          through: {
            from: "membersUsers.userId",
            to: "membersUsers.memberId",
          },
          to: "users.userId",
        },
      },
    };
  }
}

module.exports = Subscription;
