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
      `https://graph.facebook.com/v11.0/${req.user.facebookId}/accounts?fields=data,id,name,category&access_token=EAAHQ0pp9PeMBAFNWWvd43o0D1EZAmWZAMIrPBHLIHNqjgjuMmEVmm9tB7zNmBgZBKwNhnvIXuboWAfiFq1cZAVhcsywsRYrSQ3pFgrvxoNqkLuQ863fFnZCg21dL1ZA9rQ435843bbIzyQDu1v9axGAqoI8dEy5qfxS8y7OpB9oAZDZD`
    );

    console.log(data)
    res.render("index", { user: req.user, pages: data.data });

  } catch (error) {
    console.error(error);

    throw error;
  }

});

module.exports = router;
