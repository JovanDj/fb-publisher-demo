module.exports.seed = (knex) => {
  // Deletes ALL existing entries
  return knex("triggers")
    .del()
    .then(() => {
      // Inserts seed entries

      return knex("triggers").insert([{ name: "realtime" }]);
    });
};
