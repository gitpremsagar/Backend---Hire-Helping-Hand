require("dotenv").config();
const express = require("express");
const router = express.Router();
const makeQueryToDatabase = require("../src/queryDB");

// CREATE
// ========= Route to create new entry of project =============
router.post("/", async (req, res) => {
  res.send("This is create new project route");
});

// READ
// ========= Route to provide list of exixting projects =============
router.get("/", async (req, res) => {
  // Expected URL Structure = https://hostname.com/api/projects?category=something&sub_category=something

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
    "`.projects WHERE category LIKE ? OR sub_category LIKE ?";

  // execute query
  try {
    const sqlResponse = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sql,
      [`%${category}%`, `%${sub_category}%`]
    );

    // send response
    console.log(sqlResponse[0]);
    res.send(sqlResponse[0]);
  } catch (error) {
    console.log("Error in running query = ", error);
    res
      .send(500)
      .json({ message: "there is some problem in executing the query" });
  }
});

// UPDATE
// ========= Route to update an existing project =============
router.put("/", async (req, res) => {
  res.send("This is update exiting project route");
});

// DELETE
// ========= Route to delete an existing project =============
router.delete("/", async (req, res) => {
  res.send("This is delete existing project route");
});

module.exports = router;
