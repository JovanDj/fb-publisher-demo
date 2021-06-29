const { Model } = require("objection");
const Password = require("objection-password")();

class User extends Password(Model) {
  static get tableName() {
    return "users";
  }

  static get idColumn() {
    return "userId";
  }
}

module.exports = User;
