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

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors());
app.set("view engine", "pug");
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    cookie: { maxAge: 24 * 60 * 60 },
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/", require("./routes/"));
app.use("/users", require("./routes/users"));
app.use("/auth", require("./routes/auth"));

Model.knex(knex(knexFile.development));

app.listen(PORT, () => {
  console.log(`Express API listening on port ${PORT}.`);
});
