const express = require("express");
const multer = require("multer");
const auth = require("../../middlewares/auth");
// const makeQueryToDatabase = require("../../src/queryDB");
const fs = require("fs");

const router = express.Router();

// configure multer middleware to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/proposalsImages/raw");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".jpg");
  },
});
const fileFilter = (req, file, cb) => {
  // allowing only jpg files to be uploaded
  if (file.mimetype === "image/jpeg") {
    req.imageValidation = "validImage";
    cb(null, true);
  } else {
    //uploaded image is not valid, reject the user submitted image
    req.imageValidation = "invalidImage";
    cb(new Error("Invalid file format!"), false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 4, //setting maximum file size upto 2MB
  },
  fileFilter: fileFilter,
});

// define a POST route to handle file uploads
router.post(
  "/",
  auth,
  (req, res, next) => {
    //cross check if user is logged in and is requesting to change her own profile
    // if the user is not logged in or provided invalid jwt then dont allow her to upload proposal image

    // FIXME: uncomment the following lines
    // if (req.user == "notLoggedIn" || req.user == "invalidToken") {
    //   return res
    //     .status(401)
    //     .json({ error: "You are not authorized!", "req.user": req.user });
    // }

    // call the upload middleware only if the user is authorized
    upload.single("proposalHeroImage")(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        console.log("multer error = ", err);
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File size too large!" });
        }
        // some other multer error occured
        return res.status(500).json({ error: "multer error!" });
      } else if (err) {
        // is file format invalid
        if (err.message == "Invalid file format!")
          return res.status(400).json({ error: err.message });

        // An unknown error occurred when uploading.
        console.log(
          "Error occured while uploading proposalImage profile pic = ",
          err
        );
        return res.status(500).json({ error: err.message });
      }

      next();
    });
  },
  async (req, res) => {
    try {
      // send error msg if there was no file attached in the request
      if (!req.file) {
        // console.log("no file sent!");
        return res.status(400).send("No file uploaded");
      }

      return res.send(req.file.filename);
    } catch (error) {
      console.log("Failed to upload proposal image:", error);
      res.status(500).send("Failed to upload proposal image");
    }
  }
);

module.exports = router;
