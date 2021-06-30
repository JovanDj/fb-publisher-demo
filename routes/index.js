const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware");
const axios = require("axios").default;
const { FB_APP_ID, FB_APP_SECRET, FB_CALLBACK_URL } = process.env;

router.get("/", isAuthenticated, async (req, res) => {
  console.log(req.user, req.session.code);

  let pages;
  try {
    const { data } = await axios(
      `https://graph.facebook.com/v11.0/${req.user.facebookId}/accounts?fields=data,id,name,category&access_token=EAAHQ0pp9PeMBAP0vv3PDDSxgH24yraQnmaToTfClmZCXHAgh1tTMVx9yScwm9HRcWRsQe0OrGiVDo7jnZBsSs00jykjuUWNPvhMGljmgnEk9a6FtxvW5ZBNhIxNK7tNOH9pBjFNZAnWDySA23Jh1AWyEyHCEeCxiFZCxzys1YsgZDZD`
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
  const { post } = req.body;
  const { pageId } = req.params;
  console.log(pageId);

  try {
    // Get page token
    const { data: pageToken } = await axios(
      "https://graph.facebook.com/" +
        pageId +
        "?fields=access_token&access_token=EAAHQ0pp9PeMBAP0vv3PDDSxgH24yraQnmaToTfClmZCXHAgh1tTMVx9yScwm9HRcWRsQe0OrGiVDo7jnZBsSs00jykjuUWNPvhMGljmgnEk9a6FtxvW5ZBNhIxNK7tNOH9pBjFNZAnWDySA23Jh1AWyEyHCEeCxiFZCxzys1YsgZDZD"
    );

    console.log("PAGE TOKEN: ", pageToken);

    const { data } = await axios.post(
      "https://graph.facebook.com/" +
        pageId +
        "/feed?message=" +
        post +
        "&access_token=" +
        pageToken.access_token
    );

    console.log(data);

    res.redirect("/");
  } catch (error) {
    console.error(error);
  }
});
module.exports = router;
