require("dotenv").config();
const express = require("express");
const route = express.Router();
const auth = require("../middlewares/auth");

route.get("/", auth, async (req, res) => {
  //if provided token is invalid then send 400 status code
  if (req.user === "invalidToken") res.status(400).send("invalidToken");

  //send decodedToken in response
  res.send(req.user);
});

module.exports = route;
