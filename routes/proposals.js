require("dotenv").config();
const express = require("express");
const router = express.Router();
const makeQueryToDatabase = require("../src/queryDB");

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
// POST-> /api/proposal ==== To CREATE New Proposal
router.post("/", (req, res) => {
  // console.log("request body on api/proposals = ", req.body);
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
      mode, 
      heroImageName
      ) VALUES ('tir', 'des', 'gjgjh', 'jhkjk', '32', '7657657', '78969868', '24', '{\"link1\": \"https://example.com/thumbnail1.jpg\"}', '{\"Question1\": \"Answer1\", \"Question2\": \"Answer2\"}', 'hrtyty,yutyu', '{\"Requirement1\": \"Detail1\", \"Requirement2\": \"Detail2\"}', '43', 'india', 'ssdfg', 'draft', 'some');`;
  } catch (error) {
    console.log(error);
  }
  res.send("Create Proposal working...");
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
