const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const { FB_APP_ID, FB_APP_SECRET, FB_CALLBACK_URL } = process.env;
const User = require("./models/user");

// Passport session setup.
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  try {
    const sessionUser = await User.query().findById(user.userId);

    done(null, sessionUser);
  } catch (error) {
    done(error);
  }
});

passport.use(
  new FacebookStrategy(
    {
      clientID: FB_APP_ID,
      clientSecret: FB_APP_SECRET,
      callbackURL: FB_CALLBACK_URL,
      enableProof: true,
      profileFields: ["id", "name", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const {
          id: facebookId,
          first_name: firstName,
          last_name: lastName,
          email,
        } = profile._json;

        const user = await User.query().findOne({ facebookId });

        if (user) {
          return done(null, user);
        } else {
          const newUser = await User.query().insert({
            facebookId,
            firstName,
            lastName,
            email,
            password: "placeholder password",
          });
          return done(null, newUser);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
