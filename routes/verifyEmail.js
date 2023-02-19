const express = require("express");
const router = express.Router();
const makeQueryToDatabase = require("../src/queryDB.js");

router.post("/", async (req, res) => {
  const { email, code } = req.body;

  try {
    // Check if the provided email and code match the database
    const [results] = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      "SELECT `verification_details` FROM `" +
        process.env.MYSQL_DB_NAME +
        "`.`users` WHERE `email` = ?",
      [email]
    );

    if (results.length === 0) {
      // user with this Email not found
      return res.json({ message: "You entered wrong verification code!" });
    }
    console.log("Select query result = ", results);

    // ------ compare verification code to verify ---------
    const emailVerificationCode =
      results[0].verification_details.emailVerificationCode;
    if (emailVerificationCode == code) {
      console.log(emailVerificationCode, " = ", code);
      // Update the user's email_verified flag in the database
      // await makeQueryToDatabase(
      //   process.env.MYSQL_DB_NAME,
      //   "UPDATE users SET is_email_verified = ? WHERE email = ?",
      //   [true, email]
      // );

      return res.json({ message: "Email verified successfully!" });
    } else {
      console.log(emailVerificationCode, " != ", code);
      return res.json({ message: "You entered wrong verification code!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
