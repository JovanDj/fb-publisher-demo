require("dotenv").config();
require("./passport");

const express = require("express");
const { PORT } = process.env;
const knex = require("knex");
const knexFile = require("./knexfile");
const { Model } = require("objection");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const flash = require("express-flash");

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());
app.set("view engine", "pug");
app.use(cookieParser());
app.use(flash());

app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    proxy: true,

    cookie: { maxAge: 24 * 60 * 60 * 60 },
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req?.session?.passport?.user;
  next();
});

app.use("/", require("./routes/"));
app.use("/users", require("./routes/users"));
app.use("/auth", require("./routes/auth"));

Model.knex(knex(knexFile.development));

app.listen(PORT, () => {
  console.log(`Express API listening on port ${PORT}.`);
});
