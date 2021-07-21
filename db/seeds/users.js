module.exports.seed = (knex) => {
  // Deletes ALL existing entries
  return knex("users")
    .del()
    .then(() => {
      // Inserts seed entries

      return knex("users").insert([
        { email: "admin@mail.com", password: "admin" },
      ]);
    });
};
