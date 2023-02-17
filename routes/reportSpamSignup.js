require("dotenv").config();
const express = require("express");
const router = express.Router();
const makeQueryToDatabase = require("../src/queryDB");

router.get("/", async (req, res) => {
  const token = req.query.spamSignupDetectionToken;
  // console.log(`Received token: ${token}`);

  // query to update user's email as spam signup
  const updateQuery =
    "UPDATE `" +
    process.env.MYSQL_DB_NAME +
    "`.`users` SET `is_email_reported_as_spam_signup` = '1' WHERE (`spam_signup_detection_token` = ?);";

  try {
    const updateQueryResponse = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      updateQuery,
      [token]
    );

    // console.log("updateQueryResponse = ", updateQueryResponse);

    // updated the user info, so now send the response to frontend
    const responseJson = {
      message: "Reported Successfully!",
      token: token,
    };

    res.json(responseJson);
  } catch (error) {
    const responseJson = {
      message: "An error occured while reporting",
      token: token,
    };
    res.json(responseJson);
    // console.log("error in running query = ", error);
  }
});

module.exports = router;
