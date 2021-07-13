const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware");
const axios = require("axios").default;
const {
  FB_APP_ID,
  FB_APP_SECRET,
  FB_CALLBACK_URL,
  FB_ACCESS_TOKEN,
  SUPERFEEDR_TOKEN,
  SUPERFEEDR_USERNAME,
  TWITTER_API_KEY,
  TWITTER_API_SECRET_KEY,
  TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_TOKEN_SECRET,
} = process.env;
const Parser = require("rss-parser");
const parser = new Parser();
const authorization = `${SUPERFEEDR_USERNAME}:${SUPERFEEDR_TOKEN}`;
const Subscription = require("../models/subscription");
const Twit = require("twit");

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
    if (req.user.facebookId) {
      const { facebookId } = req.user.facebookId;

      const { data } = await axios(
        `https://graph.facebook.com/v11.0/${req.user.facebookId}/accounts?fields=data,id,name,category&access_token=${FB_ACCESS_TOKEN}`
      );

      res.render("index", {
        user: req.session.passport.user,
        pages: data.data,
      });
    } else {
      res.render("index", { user: req.session.passport.user });
    }
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.get("/pages/:pageId", isAuthenticated, (req, res) => {
  res.render("page", {
    page: { id: req.params.pageId, name: req.query.name },
  });
});

router.post("/pages/:pageId", isAuthenticated, async (req, res) => {
  const { rss } = req.body;
  const { pageId } = req.params;

  try {
    const { link } = feed.items[0];

    // Get page token
    const { data: pageToken } = await axios(
      `https://graph.facebook.com/${pageId}?fields=access_token&access_token=${FB_ACCESS_TOKEN}`
    );

    const { data } = await axios.post(
      "https://graph.facebook.com/" +
        pageId +
        "/feed?link=" +
        link +
        "&access_token=" +
        pageToken.access_token
    );

    res.redirect("/");
  } catch (error) {
    console.error(error);
  }
});

router.post("/feed/subscribe", isAuthenticated, async (req, res, next) => {
  const { feed, fbPageId } = req.body;
  const { twitterId, userId } = req.session.passport.user;
  console.log(feed, fbPageId, twitterId, userId);

  const { subscriptionId } = await Subscription.query().insertAndFetch({
    feedUrl: feed,
    facebookPageId: fbPageId,
    twitterId,
    userId,
  });

  try {
    const { data } = await axios.post(
      "https://push.superfeedr.com",
      {
        "hub.mode": "subscribe",
        "hub.topic": feed,
        "hub.callback": `https://stormy-ravine-62749.herokuapp.com/feeder/${subscriptionId}`,
        verify: "sync",
        retrieve: true,
        format: "json",
      },
      {
        auth: {
          username: SUPERFEEDR_USERNAME,
          password: SUPERFEEDR_TOKEN,
        },
      }
    );

    res.redirect("/feed/list");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/feed/unsubscribe", isAuthenticated, async (req, res, next) => {
  const { feed, callback } = req.body;

  try {
    const { data } = await axios.post(
      "https://push.superfeedr.com",
      {
        "hub.mode": "unsubscribe",
        "hub.topic": feed,
        "hub.callback": callback,
      },
      {
        auth: {
          username: SUPERFEEDR_USERNAME,
          password: SUPERFEEDR_TOKEN,
        },
      }
    );

    res.redirect("/feed/list");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/feed/list", isAuthenticated, async (req, res, next) => {
  try {
    const { data: pages } = await axios(
      `https://graph.facebook.com/v11.0/${req.user.facebookId}/accounts?fields=data,id,name,category&access_token=${FB_ACCESS_TOKEN}`
    );

    const { data } = await axios("https://push.superfeedr.com", {
      params: {
        "hub.mode": "list",
      },
      auth: {
        username: SUPERFEEDR_USERNAME,
        password: SUPERFEEDR_TOKEN,
      },
    });

    res.render("subscriptions", { data, pages: pages.data });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/feeder/:subscriptionId", async (req, res, next) => {
  const { items } = req.body;
  const { subscriptionId } = req.params;

  const { facebookPageId } = await Subscription.query().findById(
    subscriptionId
  );

  try {
    const { permalinkUrl } = items[0];
    // Get page token

    // Post on fb
    const { data: pageToken } = await axios(
      `https://graph.facebook.com/${facebookPageId}?fields=access_token&access_token=${FB_ACCESS_TOKEN}`
    );

    const { data } = await axios.post(
      "https://graph.facebook.com/" +
        facebookPageId +
        "/feed?link=" +
        permalinkUrl +
        "&access_token=" +
        pageToken.access_token
    );

    // Post on twitter

    tweet.post(
      "statuses/update",
      { status: permalinkUrl },
      function (err, data, response) {
        console.log(data);
      }
    );

    res.status(200).end();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
