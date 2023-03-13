const express = require("express");
const multer = require("multer");

const router = express.Router();

// configure multer middleware to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".jpg");
  },
});
const upload = multer({ storage: storage });

// define a POST route to handle file uploads
// FIXME: authenticate user before changing user's freelancer image
router.post("/", upload.single("avatar"), (req, res) => {
  try {
    if (!req.file) {
      // console.log("no file sent!");
      return res.status(400).send("No file uploaded");
    }

    // TODO: UPDATE freelancer profile image link colomn on database
    const imageUrl = `/uploads/${req.file.filename}`;
    res.send(imageUrl);
  } catch (error) {
    // console.error("Failed to upload avatar:", error);
    res.status(500).send("Failed to upload avatar");
  }
});

module.exports = router;
