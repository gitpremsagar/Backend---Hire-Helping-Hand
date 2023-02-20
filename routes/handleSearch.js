require("dotenv").config();
const express = require("express");
const router = express.Router();
const makeQueryToDatabase = require("../src/queryDB");

//  ------------- handle search request ---------------
router.get("/", async (req, res) => {
  // if there is no search term in the url then send 400 status
  if (!req.query.q)
    return res.status(400).json({ message: "no search term provided" });
  // Get search query and location from request query parameters
  const q = req.query.q || "";
  const searchLocation = req.query.searchLocation || "";
  const searchServiceType = req.query.searchServiceType || "";

  // Build SQL query to search for proposals
  let sql = `SELECT * FROM ${process.env.MYSQL_DB_NAME}.proposals WHERE title LIKE ? OR tags LIKE ? OR description LIKE ?  OR sub_category LIKE ? OR freelancer_location LIKE ?`;
  let params = [];
  params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);

  //   // following is the second version of sql statement
  //   const sql = `
  //   SELECT *
  //   FROM proposals
  //   WHERE (title LIKE CONCAT('%', ?, '%') OR tags LIKE CONCAT('%', ?, '%') OR category LIKE CONCAT('%', ?, '%'))
  //     OR freelancer_location LIKE CONCAT('%', ?, '%')
  //     OR sub_category = ?
  //   ORDER BY (
  //     CASE
  //       WHEN title LIKE CONCAT('%', ?, '%') THEN 10
  //       WHEN title LIKE CONCAT('%', ?, '%') THEN 5
  //       ELSE 1
  //     END
  //   ) DESC,
  //   number_of_appearance_in_search DESC,
  //   average_rating DESC
  //   LIMIT ?
  // `;
  //   const params = [
  //     q ?? "",
  //     q ?? "",
  //     q ?? "",
  //     searchLocation ?? "",
  //     searchServiceType ?? "",
  //     q ?? "",
  //     q ?? "",
  //     "5",
  //   ];

  // console.log(sql);
  // console.log(params);

  try {
    const selectQueryResponse = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sql,
      params
    );

    console.log(selectQueryResponse[0]);

    // Calculate relevance score for each result based on search term
    selectQueryResponse[0].forEach((result) => {
      // Initialize relevance score to 0
      let relevanceScore = 0;

      // Count number of times search term appears in title
      console.log(q);
      const titleMatchCount = (result.title.match(new RegExp(q, "gi")) || [])
        .length;
      relevanceScore += titleMatchCount * 5;

      // Count number of times search term appears in description
      const descriptionMatchCount = (
        result.tags.match(new RegExp(q, "gi")) || []
      ).length;
      relevanceScore += descriptionMatchCount * 4;

      // Count number of times search term appears in sub_category
      const sub_categoryCount = (result.tags.match(new RegExp(q, "gi")) || [])
        .length;
      relevanceScore += sub_categoryCount * 3;

      // Count number of times search term appears in tags
      const tagsMatchCount = (result.tags.match(new RegExp(q, "gi")) || [])
        .length;
      relevanceScore += tagsMatchCount * 2;

      // Count number of times search term appears in tags
      const freelancer_locationCount = (
        result.tags.match(new RegExp(q, "gi")) || []
      ).length;
      relevanceScore += freelancer_locationCount;

      // Set relevance score for result
      result.relevanceScore = relevanceScore;
    });

    // Sort selectQueryResponse by relevance score in descending order
    selectQueryResponse[0].sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Send search selectQueryResponse back to client
    res.json(selectQueryResponse[0]);
  } catch (error) {
    console.log("error in running query = ", error);
    res.status(500).send("Internal server error");
  }
});

//------------ handle suggsetions request ----------
router.get("/suggestions", async (req, res) => {
  const { q, searchLocation, searchServiceType } = req.query;

  // if search term is empty then send 400 response
  if (!q)
    return res.status(400).json({ error: "Did not find any search term!" });

  // console.log("params = ", q, searchLocation, searchServiceType);

  // build mysql query
  // let query = `SELECT tags FROM ${process.env.MYSQL_DB_NAME}.proposals WHERE title LIKE CONCAT('%', ?, '%') OR tags LIKE CONCAT('%', ?, '%')`;
  // let queryParams = [q, q];
  // if (searchServiceType && searchServiceType != "all") {
  //   query += ` OR category LIKE CONCAT('%', ?, '%')`;
  //   queryParams.push(searchServiceType);
  // }
  // if (searchLocation && searchLocation != "any") {
  //   query += ` AND freelancer_location = ?`;
  //   queryParams.push(searchLocation);
  // }

  // build mysql query
  let sql = `SELECT title FROM ${process.env.MYSQL_DB_NAME}.proposals`;
  let params = [];
  if (req.query.q) {
    sql += " WHERE (title LIKE ? OR tags LIKE ? OR category LIKE ?)";
    params.push(`%${req.query.q}%`, `%${req.query.q}%`, `%${req.query.q}%`);
  }
  if (req.query.searchServiceType) {
    if (params.length > 0) {
      sql += " AND category = ?";
    } else {
      sql += " WHERE category = ?";
    }
    params.push(req.query.searchServiceType);
  }
  if (req.query.searchLocation) {
    if (params.length > 0) {
      sql += " AND freelancer_location = ?";
    } else {
      sql += " WHERE freelancer_location = ?";
    }
    params.push(req.query.searchLocation);
  }

  // console.log("query = ", sql);
  // console.log("queryParams = ", params);

  // searche through database for relevant content and return a list of potential matches to the search query
  try {
    const selectQueryResponse = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sql,
      params
    );

    // extract the title field from the selectQueryResponse and send them back to the client
    console.log(selectQueryResponse);
    const titles = selectQueryResponse[0].map((result) => result.title); //creating new arrat containing only `tags`

    // separate each tag and asign it to a new array
    const suggestions = titles
      .flatMap((tag) => tag.split(", "))
      .reduce((acc, curr) => {
        const existing = acc.find((item) => item.title === curr);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ title: curr, count: 1 });
        }
        return acc;
      }, [])
      .sort((a, b) => b.count - a.count);
    return res.send(suggestions);
  } catch (error) {
    console.log("error in running query = ", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
