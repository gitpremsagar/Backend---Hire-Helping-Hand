const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const token = req.query.spamSignupDetectionToken;
  console.log(`Received token: ${token}`);

  // Send a response to the client
  const responseJson = {
    message: "token recieved",
    token: token,
  };
  res.json(responseJson);
});

module.exports = router;
