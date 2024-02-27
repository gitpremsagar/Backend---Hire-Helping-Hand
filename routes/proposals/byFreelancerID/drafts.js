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

//=====================================================================================================================================
//============================================ draft proposals by freelancerID ==============================================================
//=====================================================================================================================================

// GET-> /api/proposals/freelancer/:freelancerID ==== To GET a all proposals by freelancer's id
router.get("/all/:freelancerID", async (req, res) => {
  try {
    const sql = `SELECT * FROM proposals WHERE freelancer_id = ? AND mode='draft' `;
    const params = [req.params.freelancerID];
    const [result] = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sql,
      params
    );
    console.log("GET result for proposals by freelancer's id = ", result);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

// GET-> /api/proposals/drafts/:freelancerID ==== To GET a all draft proposals by freelancer's id
router.get("/drafts/:freelancerID", async (req, res) => {
  //FIXME: authorize only the auther to access this endpoint
  try {
    const sql = `SELECT * FROM proposals WHERE freelancer_id = ? AND mode="draft"`;
    const params = [req.params.freelancerID];
    const [result] = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sql,
      params
    );
    console.log("GET result for draft proposals by freelancer's id = ", result);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

// GET-> /api/proposals/active/:freelancerID ==== To GET a all active proposals by freelancer's id
router.get("/active/:freelancerID", async (req, res) => {
  //FIXME: authorize only the auther to access this endpoint
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

// GET-> /api/proposals/paused/:freelancerID ==== To GET a all paused proposals by freelancer's id
router.get("/paused/:freelancerID", async (req, res) => {
  //FIXME: authorize only the auther to access this endpoint
  try {
    const sql = `SELECT * FROM proposals WHERE freelancer_id = ? AND mode="paused"`;
    const params = [req.params.freelancerID];
    const [result] = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sql,
      params
    );
    console.log(
      "GET result for paused proposals by freelancer's id = ",
      result
    );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

module.exports = router;
