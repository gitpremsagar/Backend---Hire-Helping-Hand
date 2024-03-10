require("dotenv").config();
const express = require("express");
const makeQueryToDatabase = require("../../src/queryDB");
const auth = require("../../middlewares/auth");

const router = express.Router();

// POST-> /api/on-going-projects ==== To POST a new ongoing project
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

// GET-> /api/on-going-projects/freelancer/:freelancer_id ==== To GET all ongoing projects by freelancer_id
router.get("/freelancer/:freelancer_id", auth, async (req, res) => {
  // allow only freelancers to access their own on-going projects
  // is freelancer_id in the token same as the one in the request?
  // TODO: modify the following condition to allow admin to access all on-going projects
  if (req.user.idusers != req.params.freelancer_id) {
    return res.status(401).json({ message: "unauthorized access" });
  }

  try {
    const sql = "SELECT * FROM orders WHERE freelancer_id = ?";
    const params = [req.params.freelancer_id];
    const [result] = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sql,
      params
    );
    // console.log(
    //   "GET result for all on-going projects by freelancer_id = ",
    //   result
    // );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

// GET-> /api/on-going-projects/:projectID ==== To GET a specific ongoing project by projectID
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

// PUT-> /api/on-going-projects/:projectID ==== To UPDATE a specific ongoing project by projectID
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

// DELETE-> /api/on-going-projects/:projectID ==== To DELETE a specific ongoing project by projectID
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
