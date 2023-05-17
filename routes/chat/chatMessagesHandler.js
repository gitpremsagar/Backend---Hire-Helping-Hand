require("dotenv").config();
const express = require("express");
const makeQueryToDatabase = require("../../src/queryDB");
const auth = require("../../middlewares/auth");
const router = express.Router();

// route handler to get all chat contacts of authorised user
router.get("/:activeContactID", auth, async (req, res) => {
  // console.log(req.user);
  // console.log("req body = ", req.body);
  // dont allow user to access contacts if no or invalid token is provided
  if (req.user === "invalidToken" || req.user === "notLoggedIn")
    return res.status(400).json({ error: "invalid or no token provided" });

  const activeContactID = req.params.activeContactID;
  const userID = req.user.idusers;

  //user is autorized so send her stored messages
  try {
    const sql = `SELECT * FROM (SELECT
      cm.id,
      cm.sender_id,
      s.first_name AS sender_first_name,
      cm.recipient_id,
      r.first_name AS recipient_first_name,
      cm.message,
      cm.created_at,
      cm.has_seen
    FROM
      chat_messages cm
      JOIN users s ON cm.sender_id = s.idusers
      JOIN users r ON cm.recipient_id = r.idusers
    WHERE
      (cm.sender_id = ? AND cm.recipient_id = ?) OR (cm.sender_id = ? AND cm.recipient_id = ?) ORDER BY cm.id DESC LIMIT 30) as ch_msg ORDER BY id ASC`;

    const params = [activeContactID, userID, userID, activeContactID];
    const [rows] = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sql,
      params
    );
    // console.log("rows = ", rows);
    res.send(rows);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.log(error);
  }
});

module.exports = router;
