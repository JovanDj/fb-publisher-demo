const express = require("express");
const router = express.Router();
const passport = require("passport");

router.post(
  "/facebook",
  passport.authenticate("facebook", {
    authType: "reauthenticate",
    scope: [
      "email",
      "pages_manage_posts",
      "pages_show_list",
      "pages_read_engagement",
    ],
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
  })
);

router.post("/twitter", passport.authenticate("twitter"));

router.get(
  "/twitter/callback",
  passport.authenticate("twitter", {
    failureRedirect: "/login",
    successRedirect: "/",
  }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

router.post("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

router.get("/login", (req, res) => {
  res.render("login");
});
module.exports = router;
