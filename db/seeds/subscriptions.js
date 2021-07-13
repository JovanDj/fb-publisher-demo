module.exports.seed = (knex) => {
  // Deletes ALL existing entries
  return knex("subscriptions")
    .del()
    .then(() => {
      // Inserts seed entries

      return knex("subscriptions").insert([
        {
          facebookPageId: 259503337425377,
          twitterId: 1084422979835125761,
          userId: 1,
          feedUrl: "https://jovandjukic.com/feed",
        },
      ]);
    });
};
