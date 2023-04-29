require("dotenv").config();
const express = require("express");
const router = express.Router();
const makeQueryToDatabase = require("../../src/queryDB");

// GET all topLevelCategories via /api/topLevelCategories
router.get("/", async (req, res) => {
  try {
    const sql = `SELECT * FROM top_level_categories;`;
    const [rows] = await makeQueryToDatabase(process.env.MYSQL_DB_NAME, sql);
    res.send(rows);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

// GET a topLevelCategory by ID via /api/topLevelCategories/:id
router.get("/:id", (req, res) => {});

// CREATE a topLevelCategory via /api/topLevelCategories
router.post("/", (req, res) => {});

// PUT UPDATE a topLevelCategory by id via /api/topLevelCategories/:id
router.put("/:id", (req, res) => {});

// GET a topLevelCategory by id via /api/topLevelCategories
router.delete("/:id", (req, res) => {});

module.exports = router;
