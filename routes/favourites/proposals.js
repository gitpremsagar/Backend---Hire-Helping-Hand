require("dotenv").config();
const express = require("express");
const router = express.Router();
const makeQueryToDatabase = require("../src/queryDB");
const auth = require("../middlewares/auth");

// GET-> /api/favourite/proposal  ==== To Get All Proposals
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
// POST-> /api/proposal ==== To CREATE New Proposal
router.post("/", auth, async (req, res) => {
  const getTagsString = (tagsArray) => {
    let tagsString = "";
    tagsArray.map((tag, i) => {
      tagsString = tagsString.length > 1 ? tagsString + ", " + tag : tag;
    });
    return tagsString;
  };

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
        ?, ?, ?, ?, ?, ?, ?, ?);`;
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
      req.user.idusers,
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
      res.json({ inserted: true, lastInsertID: result.insertId });
      // console.log(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

// POST-> /api/proposal/:id ==== To UPDATE a proposal by id
router.put("/:id", (req, res) => {
  console.log("request body on api/proposals = ", req.body);
  res.send("working");
});

// POST-> /api/proposal ==== To DELETE a Proposal by ID
router.delete("/:id", (req, res) => {
  console.log("request body on api/proposals = ", req.body);
  res.send("working");
});

module.exports = router;
