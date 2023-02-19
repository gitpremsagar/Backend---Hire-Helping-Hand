const express = require("express");
const router = express.Router();

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
  connection.query(query, (err, results) => {
    if (err) {
      console.log("Error executing mysql query: " + err.stack);
      return res.status(500).json({ message: "Internal server error" });
    }

    // send response with search results
    return res.status(200).json({ results });
  });
});

// close mysql connection
// connection.end((err) => {
//   if (err) {
//     console.log("Error closing mysql connection: " + err.stack);
//     return;
//   }
//   console.log("Mysql connection closed");
// });

//------------ handle suggsetions request ----------
router.get("/suggestions", (req, res) => {
  const { q, searchLocation, searchServiceType } = req.body;

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
      tags: [
        "SEO",
        "digital marketing",
        "google analytics",
        "content marketing",
      ],
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

  res.send(dummyFreelancers);

  // build mysql query
  let query = `SELECT * FROM proposals WHERE title LIKE '%${q}%'`;
  if (searchLocation !== "") {
    query += ` AND freelancer_location = '${searchLocation}'`;
  }
  if (searchServiceType !== "") {
    query += ` AND service_type = '${searchServiceType}'`;
  }
});

module.exports = router;
