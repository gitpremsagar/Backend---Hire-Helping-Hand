require("dotenv").config();
const express = require("express");
const router = express.Router();
const makeQueryToDatabase = require("../src/queryDB");

const dummyFreelancers = [
  {
    proposal_title: "Professional Web Development",
    description:
      "I can build you a professional website with modern web development technologies.",
    freelancer_name: "John Doe",
    freelancer_location: "New York",
    tags: ["web development", "frontend", "backend", "javascript"],
  },
  {
    proposal_title: "E-commerce Store Development",
    description:
      "I can create a fully functional e-commerce store for your business needs.",
    freelancer_name: "Jane Doe",
    freelancer_location: "Los Angeles",
    tags: ["e-commerce", "web design", "react", "node.js"],
  },
  {
    proposal_title: "Mobile App Development",
    description:
      "I can create mobile applications for both Android and iOS platforms.",
    freelancer_name: "Bob Smith",
    freelancer_location: "San Francisco",
    tags: ["mobile app", "react native", "swift", "java"],
  },
  {
    proposal_title: "SEO Optimization",
    description:
      "I can optimize your website for search engines and increase its visibility.",
    freelancer_name: "Alice Johnson",
    freelancer_location: "Chicago",
    tags: ["SEO", "digital marketing", "google analytics", "content marketing"],
  },
  {
    proposal_title: "Data Analysis and Visualization",
    description:
      "I can help you analyze and visualize your data using the latest tools and techniques.",
    freelancer_name: "Mark Wilson",
    freelancer_location: "Boston",
    tags: ["data analysis", "visualization", "python", "machine learning"],
  },
  {
    proposal_title: "Graphic Design Services",
    description:
      "I can provide you with high-quality graphic design services for your branding needs.",
    freelancer_name: "Emily Brown",
    freelancer_location: "Miami",
    tags: ["graphic design", "logo design", "branding", "illustration"],
  },
  {
    proposal_title: "Social Media Marketing",
    description:
      "I can help you increase your brand awareness and engagement on social media platforms.",
    freelancer_name: "David Lee",
    freelancer_location: "Seattle",
    tags: ["social media", "marketing", "content creation", "analytics"],
  },
  {
    proposal_title: "UI/UX Design",
    description:
      "I can design user interfaces and experiences for your web and mobile applications.",
    freelancer_name: "Sarah Kim",
    freelancer_location: "Houston",
    tags: ["UI", "UX", "web design", "mobile design"],
  },
  {
    proposal_title: "Content Writing Services",
    description:
      "I can provide you with high-quality content writing services for your business needs.",
    freelancer_name: "Karen Chen",
    freelancer_location: "Dallas",
    tags: ["content writing", "copywriting", "blogging", "SEO"],
  },
  {
    proposal_title: "Video Editing and Production",
    description:
      "I can help you produce and edit professional videos for your business or personal use.",
    freelancer_name: "Tom Lee",
    freelancer_location: "Atlanta",
    tags: ["video editing", "production", "adobe premiere", "after effects"],
  },
];

//  ------------- handle search request ---------------
router.get("/", (req, res) => {
  const { q, searchLocation, searchServiceType } = req.body;

  // build mysql query
  let query = `SELECT * FROM proposals WHERE title LIKE '%${q}%'`;
  if (searchLocation !== "") {
    query += ` AND freelancer_location = '${searchLocation}'`;
  }
  if (searchServiceType !== "") {
    query += ` AND service_type = '${searchServiceType}'`;
  }

  // execute mysql query
  // connection.query(query, (err, results) => {
  //   if (err) {
  //     console.log("Error executing mysql query: " + err.stack);
  //     return res.status(500).json({ message: "Internal server error" });
  //   }

  //   // send response with search results
  //   return res.status(200).json({ results });
  // });
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
