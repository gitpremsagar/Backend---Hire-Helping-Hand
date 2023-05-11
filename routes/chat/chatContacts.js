require("dotenv").config();
const express = require("express");
const makeQueryToDatabase = require("../../src/queryDB");
const auth = require("../../middlewares/auth");
const router = express.Router();

// route handler to get all chat contacts of authorised user
router.get("/", auth, async (req, res) => {
  // dont allow user to access contacts if no or invalid token is provided
  console.log(req.user);
  if (req.user === "invalidToken" || req.user === "notLoggedIn")
    return res.status(400).json({ error: "invalid or no token provided" });

  //user is autorized so send her contact list
  try {
    const sql = `SELECT DISTINCT cm.sender_id, cm.recipient_id, u1.first_name AS sender_first_name,u1.last_name AS sender_last_name, u2.first_name AS recipient_first_name,u2.last_name AS recipient_last_name
    FROM chat_messages cm
    JOIN users u1 ON u1.idusers = cm.sender_id
    JOIN users u2 ON u2.idusers = cm.recipient_id
    WHERE cm.sender_id = ? OR cm.recipient_id = ?;`;

    //   const sql = `SELECT
    //   cm.id,
    //   cm.sender_id,
    //   s.first_name AS sender_first_name,
    //   cm.recipient_id,
    //   r.first_name AS recipient_first_name,
    //   cm.message,
    //   cm.created_at,
    //   cm.has_seen
    // FROM
    //   chat_messages cm
    //   JOIN users s ON cm.sender_id = s.idusers
    //   JOIN users r ON cm.recipient_id = r.idusers
    // WHERE
    //   cm.sender_id = ? OR cm.recipient_id = ?;`;
    // WHERE (sender_id = ? OR recipient_id = ?);`;
    const params = [req.user.idusers, req.user.idusers];
    const [rows] = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sql,
      params
    );
    res.send(rows);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.log("this is where the error ", error);
  }
});

module.exports = router;
