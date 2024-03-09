require("dotenv").config();
const express = require("express");
const router = express.Router();
const makeQueryToDatabase = require("../src/queryDB");
const auth = require("../middlewares/auth");

const getTagsString = (tagsArray) => {
  let tagsString = "";
  tagsArray.map((tag, i) => {
    tagsString = tagsString.length > 1 ? tagsString + ", " + tag : tag;
  });
  return tagsString;
};

// GET-> /api/proposal  ==== To Get All Proposals
router.get("/", async (req, res) => {
  // extracting category and sub_category from url
  const { category, sub_category } = req.query;

  // sending 400 response if no category or sub_category provided
  if (!category || !sub_category)
    return res
      .status(400)
      .json({ message: "no category or sub_category provided" });

  // build query to get proposals with reqested category and sub_category
  const sql =
    "SELECT * FROM `" +
    process.env.MYSQL_DB_NAME +
    "`.proposals WHERE top_level_category LIKE ? OR mid_level_category LIKE ?";

  // execute query
  try {
    const sqlResponse = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sql,
      [`%${category}%`, `%${sub_category}%`]
    );

    // send response
    res.send(sqlResponse[0]);
  } catch (error) {
    console.log("Error in running query = ", error);
    res
      .send(500)
      .json({ message: "there is some problem in executing the query" });
  }
});

//  FIXME: authenticate user before uploading the proposal
// POST-> /api/proposals ==== To CREATE New Proposal
router.post("/", auth, async (req, res) => {
  // const getTagsString = (tagsArray) => {
  //   let tagsString = "";
  //   tagsArray.map((tag, i) => {
  //     tagsString = tagsString.length > 1 ? tagsString + ", " + tag : tag;
  //   });
  //   return tagsString;
  // };

  try {
    const sql = `INSERT INTO proposals (
      title, 
      description, 
      top_level_category, 
      mid_level_category, 
      bottom_level_category, 
      price_basic, 
      created_at, 
      updated_at, 
      freelancer_id, 
      thumbnail_links, 
      faqs, 
      tags, 
      requirements_detail, 
      delivery_duration, 
      freelancer_location, 
      heroImageName,
      mode
      ) VALUES (?, ?, 
        (SELECT name from top_level_categories WHERE id = ?), 
        (SELECT name from mid_level_categories WHERE id = ?),
        (SELECT name from bottom_level_categories WHERE id = ?),
        ?,
        now(),
        now(), 
        ${req.user.idusers},
        ?, ?, ?, ?, ?, 
        (SELECT user_country FROM users WHERE idusers=?), 
        ?, ?);`;
    const params = [
      req.body.proposal.proposalTitle,
      req.body.proposal.proposalDescription,
      req.body.proposal.topLevelCategoryID,
      req.body.proposal.midLevelCategoryID,
      req.body.proposal.bottomLevelCategoryID,
      req.body.proposal.proposalCost,
      req.body.proposal.extraImagesName,
      req.body.proposal.faqs,
      getTagsString(req.body.proposal.tags),
      req.body.proposal.requirements,
      req.body.proposal.proposalDeliveryDuration,
      req.user.idusers, //FIXME: provide freelancer's location
      req.body.proposal.heroImageName,
      req.body.proposalMode,
    ];
    const [result] = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sql,
      params
    );
    console.log(result);
    if (result.affectedRows > 0) {
      // return the inserted proposal's ID
      res.json({ inserted: true, lastInsertID: result.insertId });
      console.log(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

// GET-> /api/proposals/:id ==== To GET a proposal by id
router.get("/:id", auth, async (req, res) => {
  try {
    // check if the user is the owner of the proposal
    const sqlToCrossCheck = `SELECT proposal_id FROM proposals WHERE proposal_id = ? AND freelancer_id = ?`;
    const paramsToCrossCheck = [req.params.id, req.user.idusers];
    const [resultToCrossCheck] = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sqlToCrossCheck,
      paramsToCrossCheck
    );
    if (resultToCrossCheck.length === 0) {
      // console.log("unauthorized access attempt");
      return res.status(401).json({ message: "unauthorized access" });
    }

    const sql = `SELECT * FROM proposals WHERE proposal_id = ?`;
    const params = [req.params.id];
    const [result] = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sql,
      params
    );
    console.log("GET result for proposal by id = ", result);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

// GET-> /api/proposals/freelancer/:freelancerID ==== To GET a all proposals by freelancer's id
router.get("/all/:freelancerID", async (req, res) => {
  try {
    const sql = `SELECT * FROM proposals WHERE freelancer_id = ?`;
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

// GET-> /api/proposals/active/:freelancerID ==== To GET a all active proposals by freelancer's id
router.get("/active/:freelancerID", async (req, res) => {
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

// POST-> /api/proposal/:id ==== To UPDATE a proposal by id
router.put("/:id", async (req, res) => {
  // FIXME: Allow user to update only their own proposal by cross checking that if this proposalID's creator is this user himself or not
  console.log("Update request body on api/proposals = ", req.body);
  try {
    const sql = `UPDATE proposals SET
      title=?,
      description=?,
      top_level_category=(SELECT name from top_level_categories WHERE id = ?),
      mid_level_category=(SELECT name from mid_level_categories WHERE id = ?),
      bottom_level_category=(SELECT name from bottom_level_categories WHERE id = ?),
      price_basic=?,
      updated_at=NOW(),
      thumbnail_links=?,
      faqs=?,
      tags=?,
      requirements_detail=?,
      delivery_duration=?,
      heroImageName=?,
      mode=?
      WHERE
      proposal_id = ?;`;
    const params = [
      req.body.proposal.proposalTitle,
      req.body.proposal.proposalDescription,
      req.body.proposal.topLevelCategoryID,
      req.body.proposal.midLevelCategoryID,
      req.body.proposal.bottomLevelCategoryID,
      req.body.proposal.proposalCost,
      req.body.proposal.extraImagesName,
      req.body.proposal.faqs,
      getTagsString(req.body.proposal.tags),
      req.body.proposal.requirements,
      req.body.proposal.proposalDeliveryDuration,
      req.body.proposal.heroImageName,
      req.body.proposalMode,
      req.body.proposal.proposalID,
    ];
    const [result] = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sql,
      params
    );
    console.log(result);
    if (result.affectedRows > 0) {
      // return the inserted proposal's ID
      res.json({ updated: true });
      console.log("Update proposal result = ", result);
    }
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

// POST-> /api/proposals ==== To DELETE a Proposal by ID
router.delete("/:id", (req, res) => {
  console.log("request body on api/proposals = ", req.body);
  res.send("working");
});

module.exports = router;
