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

    res.render("index", { user: req.user, pages: data.data });
  } catch (error) {
    console.error(error);

    throw error;
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

  try {
    const { data } = await axios.post(
      "https://push.superfeedr.com",
      {
        "hub.mode": "subscribe",
        "hub.topic": feed,
        "hub.callback": `https://stormy-ravine-62749.herokuapp.com/feeder/${fbPageId}`,
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

    console.log(pages);

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

router.post("/feeder/:fbPageId", (req, res) => {
  console.log(req.body, req.params.fbPageId);

  res.status(200).end();
});

module.exports = router;
