const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const {
  FB_APP_ID,
  FB_APP_SECRET,
  FB_CALLBACK_URL,
  TWITTER_API_KEY,
  TWITTER_API_SECRET_KEY,
  TWITTER_CALLBACK_URL,
} = process.env;
const User = require("./models/user");
const TwitterStrategy = require("passport-twitter").Strategy;
const LocalStrategy = require("passport-local").Strategy;

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
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      if (!req.user) {
        try {
          const {
            id: facebookId,
            first_name: firstName,
            last_name: lastName,
            email,
          } = profile._json;

          const user = await User.query().findOne({ facebookId });

          if (user) {
            const updatedUser = await User.query().patchAndFetchById(
              user.userId,
              {
                facebookId,
              }
            );

            return done(null, updatedUser);
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
      } else {
        const { id: facebookId } = profile._json;
        await User.query().patchAndFetchById(req.user.userId, {
          facebookId,
        });

        return done(null, req.user);
      }
    }
  )
);

passport.use(
  new TwitterStrategy(
    {
      consumerKey: TWITTER_API_KEY,
      consumerSecret: TWITTER_API_SECRET_KEY,
      callbackURL: TWITTER_CALLBACK_URL,
      includeEmail: true,
      passReqToCallback: true,
    },
    async (req, token, tokenSecret, profile, done) => {
      if (!req.user) {
        try {
          const { id: twitterId } = profile;
          const email = profile.emails[0].value;
          const user = await User.query().findOne({ twitterId });

          if (user) {
            const updatedUser = await User.query().patchAndFetchById(
              user.userId,
              {
                twitterId,
              }
            );
            return done(null, updatedUser);
          } else {
            const newUser = await User.query().insert({
              twitterId,
              email,
              password: "placeholder password",
            });
            return done(null, newUser);
          }
        } catch (error) {
          return done(error, null);
        }
      } else {
        const { id: twitterId } = profile;

        const updatedUser = await User.query().patchAndFetchById(
          req.user.userId,
          {
            twitterId,
          }
        );
        return done(null, req.user);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const user = await User.query().findOne({ email });
        if (user) {
          return done(null, user);
        }

        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }

        if (!user.password === password) {
          return done(null, false, { message: "Incorrect password." });
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);
