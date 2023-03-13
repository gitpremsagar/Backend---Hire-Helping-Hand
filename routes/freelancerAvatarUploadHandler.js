const express = require("express");
const multer = require("multer");
const auth = require("../middlewares/auth");

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

router.post(
  "/:idusers",
  auth,
  (req, res, next) => {
    // if the user is not logged in or provided invalid jwt then dont allow her to upload profile pic
    if (req.user == "notLoggedIn" || req.user == "invalidToken") {
      return res.status(401).json({ error: "You are not authorized!" });
    }

    // don't allow user to change someone else's profile pic
    const userIdOnURL = req.params.idusers;
    const userIdOnJWT = req.user.idusers;
    if (userIdOnURL != userIdOnJWT) {
      return res.status(401).json({ error: "You are not authorized!" });
    }

    // call the upload middleware only if the user is authorized
    upload.single("avatar")(req, res, next);
  },
  (req, res) => {
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
  }
);

module.exports = router;
