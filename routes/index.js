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
} = process.env;
const Parser = require("rss-parser");
const parser = new Parser();
const authorization = `${SUPERFEEDR_USERNAME}:${SUPERFEEDR_TOKEN}`;

router.get("/", isAuthenticated, async (req, res) => {
  let pages;
  try {
    const { data } = await axios(
      `https://graph.facebook.com/v11.0/${req.user.facebookId}/accounts?fields=data,id,name,category&access_token=${FB_ACCESS_TOKEN}`
    );

    console.log(data);
    res.render("index", { user: req.user, pages: data.data });
  } catch (error) {
    console.error(error);

    throw error;
  }
});

router.get("/pages/:pageId", (req, res) => {
  res.render("page", {
    page: { id: req.params.pageId, name: req.query.name },
  });
});

router.post("/pages/:pageId", async (req, res) => {
  const { rss } = req.body;
  const { pageId } = req.params;

  try {
    const { link } = feed.items[0];

    // Get page token
    const { data: pageToken } = await axios(
      `https://graph.facebook.com/${pageId}?fields=access_token&access_token=${FB_ACCESS_TOKEN}`
    );

    console.log("PAGE TOKEN: ", pageToken);

    const { data } = await axios.post(
      "https://graph.facebook.com/" +
        pageId +
        "/feed?link=" +
        link +
        "&access_token=" +
        pageToken.access_token
    );

    console.log(data);

    res.redirect("/");
  } catch (error) {
    console.error(error);
  }
});

router.post("/feed/subscribe", async (req, res, next) => {
  const { feed } = req.body;

  try {
    const res = await axios("https://push.superfeedr.com", {
      params: {
        "hub.mode": "subscribe",
        "hub.topic": feed,
        "hub.callback": "https://stormy-ravine-62749.herokuapp.com/feeder",
        verify: "sync",
        retrieve: true,
        format: "json",
        authorization,
      },
    });

    console.log(res.data);

    res.status(200).end();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/feed/unsubscribe", async (req, res, next) => {
  const { feed } = req.body;

  try {
    const { data } = await axios.post(
      "https://push.superfeedr.com",
      {
        "hub.mode": "unsubscribe",
        "hub.topic": feed,
        "hub.callback": "https://stormy-ravine-62749.herokuapp.com/feeder",
      },
      {
        auth: {
          username: SUPERFEEDR_USERNAME,
          password: SUPERFEEDR_TOKEN,
        },
      }
    );

    console.log(data);

    res.status(200).end();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/feed/list", async (req, res, next) => {
  try {
    const { data } = await axios("https://push.superfeedr.com", {
      params: {
        "hub.mode": "list",
      },
      auth: {
        username: SUPERFEEDR_USERNAME,
        password: SUPERFEEDR_TOKEN,
      },
    });

    console.log(data);

    res.render("subscriptions", { data });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/feeder", (req, res) => {
  console.log(req.body);

  res.status(200).end();
});

module.exports = router;
