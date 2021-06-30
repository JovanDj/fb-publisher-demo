const express = require("express");
const router = express.Router();
const passport = require("passport");

router.post(
  "/facebook",
  passport.authenticate("facebook", {
    authType: "reauthenticate",
    scope: ["email", "pages_manage_posts", "pages_show_list"],
  })
);

router.get(
  "/facebook/callback",
  [
    function (req, res, next) {
      req.session.code = req.query.code;
      next();
    },
    passport.authenticate("facebook", {
      successRedirect: "/",
      failureRedirect: "/auth/login",
    }),
  ],
  function (req, res) {
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
