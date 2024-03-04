require("dotenv").config();
const express = require("express");
const makeQueryToDatabase = require("../../src/queryDB");

const router = express.Router();

// GET-> /api/ongoing-projects ==== To GET all ongoing projects
router.get("/", async (req, res) => {
  try {
    const sql = "SELECT * FROM ongoing_projects";
    const params = [];
    const [result] = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sql,
      params
    );
    // console.log("GET result for all ongoing projects = ", result);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

// GET-> /api/ongoing-projects/:projectID ==== To GET a specific ongoing project by projectID
router.get("/:projectID", async (req, res) => {
  try {
    const sql = "SELECT * FROM ongoing_projects WHERE project_id = ?";
    const params = [req.params.projectID];
    const [result] = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sql,
      params
    );
    // console.log("GET result for specific ongoing project = ", result);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

// POST-> /api/ongoing-projects ==== To POST a new ongoing project
router.post("/", async (req, res) => {
  try {
    // sample sql statement
    // INSERT INTO ongoing_projects
    // (order_id, client_id, freelancer_id, project_id, proposal_id, order_date, service_description, service_price, delivery_date, status)
    // VALUES
    // (1, 100, 200, 300, 400, NOW(), 'This is a test service description', 500.00, DATE_ADD(NOW(), INTERVAL 7 DAY), 'In Progress'),
    // (2, 101, 201, 301, 401, NOW(), 'This is another test service description', 600.00, DATE_ADD(NOW(), INTERVAL 10 DAY), 'In Progress');

    // FIXME: set interval to 7 days for now, but it should be based on the delivery date
    const sql = `INSERT INTO ongoing_projects 
    (client_id, freelancer_id, project_id, proposal_id, order_date, service_description, service_price, delivery_date, status) 
    VALUES 
    (?, ?, ?, ?, NOW(), ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), 'Not Started')`;
    const params = [
      req.body.client_id,
      req.body.freelancer_id,
      req.body.project_id,
      req.body.proposal_id,
      req.body.service_description,
      req.body.service_price,
    ];
    const result = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sql,
      params
    );
    // console.log("POST result for new ongoing project = ", result);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

// PUT-> /api/ongoing-projects/:projectID ==== To UPDATE a specific ongoing project by projectID
router.put("/:projectID", async (req, res) => {
  try {
    const sql = `UPDATE ongoing_projects 
    SET client_id = ?, freelancer_id = ?, project_id = ?, proposal_id = ?, service_description = ?, service_price = ?, delivery_date = ?, status = ?
    WHERE project_id = ?`;
    const params = [
      req.body.client_id,
      req.body.freelancer_id,
      req.body.project_id,
      req.body.proposal_id,
      req.body.service_description,
      req.body.service_price,
      req.body.delivery_date,
      req.body.status,
      req.params.projectID,
    ];
    const result = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sql,
      params
    );
    // console.log("PUT result for updated ongoing project = ", result);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

// DELETE-> /api/ongoing-projects/:projectID ==== To DELETE a specific ongoing project by projectID
router.delete("/:projectID", async (req, res) => {
  try {
    const sql = "DELETE FROM ongoing_projects WHERE project_id = ?";
    const params = [req.params.projectID];
    const result = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sql,
      params
    );
    // console.log("DELETE result for specific ongoing project = ", result);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

module.exports = router;
