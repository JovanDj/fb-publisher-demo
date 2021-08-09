const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware");
const axios = require("axios").default;
const {
  FB_ACCESS_TOKEN,
  TWITTER_API_KEY,
  TWITTER_API_SECRET_KEY,
  TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_TOKEN_SECRET,
  MAILTRAP_USER,
  MAILTRAP_PASSWORD,
} = process.env;
const Workflow = require("../models/workflow");
const Trigger = require("../models/trigger");
const Twit = require("twit");
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: MAILTRAP_USER,
    pass: MAILTRAP_PASSWORD,
  },
});

const tweet = new Twit({
  consumer_key: TWITTER_API_KEY,
  consumer_secret: TWITTER_API_SECRET_KEY,
  access_token: TWITTER_ACCESS_TOKEN,
  access_token_secret: TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  strictSSL: true, // optional - requires SSL certificates to be valid.
});

router.get("/", isAuthenticated, async (req, res, next) => {
  try {
    const workflows = await Workflow.query();

    res.render("index", { user: req.session.passport.user, workflows });
  } catch (error) {
    next(error);
  }
});

router.post("/workflow/", isAuthenticated, async (req, res, next) => {
  try {
    const { fbPageId, sendMail, postOnTwitter, message } = req.body;
    const { twitterId, userId } = req.session.passport.user;

    await Workflow.query().insert({
      facebookPageId: fbPageId,
      twitterId: postOnTwitter ? twitterId : null,
      userId,
      sendMail,
      message,
    });

    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

router.get("/workflows", isAuthenticated, async (req, res, next) => {
  try {
    const [{ data: pages }, triggers] = await Promise.all([
      axios(
        `https://graph.facebook.com/v11.0/${req.session.passport.user.facebookId}/accounts?fields=data,id,name,category&access_token=${FB_ACCESS_TOKEN}`
      ),
      Trigger.query(),
    ]);

    res.render("workflows", { triggers, pages: pages.data });
  } catch (error) {
    next(error);
  }
});

router.post("/feed/", async (req, res, next) => {
  const { link, title, author } = req.body;

  try {
    const workflows = await Workflow.query().withGraphJoined({ user: true });

    workflows.forEach(async (workflow) => {
      const { facebookPageId, twitterId, sendMail, user, message } = workflow;

      const text = () => {
        const strings = message.split(" ");
        const keys = Object.keys(req.body);

        strings.forEach((string, i) => {
          keys.forEach((key, k) => {
            if (
              key === string.replace("$", "").replace("{", "").replace("}", "")
            ) {
              strings[i] = req.body[key];
            }
          });
        });

        return strings.join(" ");
      };

      // Post on fb
      if (facebookPageId) {
        const { data: pageToken } = await axios(
          `https://graph.facebook.com/${facebookPageId}?fields=access_token&access_token=${FB_ACCESS_TOKEN}`
        );

        await axios.post(
          "https://graph.facebook.com/" +
            facebookPageId +
            "/feed?link=" +
            link +
            "&message=" +
            `${text()} ${link}` +
            "&access_token=" +
            pageToken.access_token
        );

        console.log("Posted on facebook!");
      }

      // Post on twitter

      if (twitterId) {
        await tweet.post("statuses/update", { status: `${text()} ${link}` });
        console.log("Posted on twitter!");
      }
      // Send Email
      if (sendMail) {
        const { email } = user;

        await transport.sendMail({
          from: "fb-publisher-demo@digitalinfinity.com",
          to: email,
          subject: "New episode.",
          html: `<p>${text()}</p><p>New episode: <a href="${link}">${title}</a></p>`,
        });

        console.log("Sent email!");
      }
    });

    res.status(200).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
