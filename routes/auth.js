const express = require("express");
const router = express.Router();
const passport = require("passport");

router.post(
  "/facebook",
  passport.authorize("facebook", {
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
  passport.authorize("facebook", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
  }),
  (req, res) => {
    // Associate the Twitter account with the logged-in user.
    // account.userId = user?.userId;
    // account.save(function (err) {
    //   if (err) {
    //     return self.error(err);
    //   }
    //   self.redirect("/");
    // });

    res.redirect("/");
  }
);

router.post("/twitter", passport.authorize("twitter"));

router.get(
  "/twitter/callback",
  passport.authorize("twitter", {
    failureRedirect: "/login",
    successRedirect: "/",
  }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

router.post("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })
);

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.create({ email, password });

  req.login(user, (err) => {
    if (err) {
      return next(err);
    }
    return res.redirect("/");
  });
});
module.exports = router;
