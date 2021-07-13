const { Model } = require("objection");
const Password = require("objection-password")();

class User extends Password(Model) {
  static get tableName() {
    return "users";
  }

  static get idColumn() {
    return "userId";
  }

  static get relationMappings() {
    const Subscription = require("./subscription");

    return {
      subscriptions: {
        relation: Model.HasManyRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one. We use a model
        // subclass constructor `Animal` here.
        modelClass: Subscription,
        join: {
          from: "users.subscriptionId",
          to: "subscriptions.userId",
        },
      },
    };
  }
}

module.exports = User;
