require("dotenv").config();
const express = require("express");
const route = express.Router();

//handling get request
route.get("/", (req, res) => {
  res.send("this is login route");
});

module.exports = route;
