require("dotenv").config();
const express = require("express");
const router = express.Router();
const makeQueryToDatabase = require("../../../src/queryDB.js");
const auth = require("../../../middlewares/auth.js");

const getTagsString = (tagsArray) => {
  let tagsString = "";
  tagsArray.map((tag, i) => {
    tagsString = tagsString.length > 1 ? tagsString + ", " + tag : tag;
  });
  return tagsString;
};

// ============================= CREATE ONE =================================

// ============================= READ ALL =================================

// GET-> /api/proposals/freelancer/active/:freelancerID ==== To GET a all active proposals by freelancer's id
router.get("/all/:freelancerID", async (req, res) => {
  try {
    const sql = `SELECT * FROM proposals WHERE freelancer_id = ? AND mode="published"`;
    const params = [req.params.freelancerID];
    const [result] = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sql,
      params
    );
    console.log(
      "GET result for active proposals by freelancer's id = ",
      result
    );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

// ============================= READ ONE BY ID =================================

// ============================= UPDATE ONE BY ID =================================

// ============================= DELETE ONE BY ID =================================

module.exports = router;
