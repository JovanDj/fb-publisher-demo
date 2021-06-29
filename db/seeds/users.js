module.exports.seed = (knex) => {
  // Deletes ALL existing entries
  return knex("users")
    .del()
    .then(() => {
      // Inserts seed entries
      const faker = require("faker");

      const users = Array.from({ length: 100 }, () => {
        return {
          email: faker.internet.exampleEmail(),
          password: faker.internet.password(),
        };
      });

      return knex("users").insert(users);
    });
};
