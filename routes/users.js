const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/", async (req, res, next) => {
  const users = await User.query();
  res.json(users);
});

router.get("/:userId", async (req, res, next) => {
  const { userId } = req.params;
  const user = await User.query().findById(userId);
  res.json(user);
});

router.post("/", async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.query().insert({
    email,
    password,
  });

  res.json(user);
});

router.patch("/:userId", async (req, res, next) => {
  const { email, password } = req.body;
  const { userId } = req.params;

  const user = await User.query().patchAndFetchById(userId, {
    email,
    password,
  });

  res.json(user);
});

router.delete("/:userId", async (req, res, next) => {
  const { userId } = req.params;

  const numberOfDeletedRows = await User.query().deleteById(userId);

  res.json({ numberOfDeletedRows });
});

module.exports = router;
