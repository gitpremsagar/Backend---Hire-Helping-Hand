const express = require("express");
const multer = require("multer");
const auth = require("../../middlewares/auth");
const makeQueryToDatabase = require("../../src/queryDB");
const fs = require("fs");

const router = express.Router();

// configure multer middleware to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/freelancerProfileImages");
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
    fileSize: 1024 * 1024 * 2, //setting maximum file size upto 2MB
  },
  fileFilter: fileFilter,
});

// define function to update `profile_pic_as_freelancer` colomn in `users` table //FIXME: complete the code of this function
async function updateProfilePicAsFreelancerColoumnInDatabase(
  imageName,
  userID
) {
  const sqlStatement =
    "UPDATE `" +
    process.env.MYSQL_DB_NAME +
    "`.`users` SET `profile_pic_as_freelancer` = ? WHERE (`idusers` = ?);";
  // execute the query
  try {
    const queryExuectionResponse = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      sqlStatement,
      [imageName, userID]
    );

    // check if any rows were affected by the update
    if (queryExuectionResponse.affectedRows === 0) {
      return {
        success: false,
        reason: "User not found",
      };
    }

    return {
      success: true,
      reason: "Profile pic updated successfully",
    };
  } catch (error) {
    console.log("profile_pic_as_client UPDATE error = ", error);
    return {
      success: false,
      reason:
        "Failed to update profile pic due to some error in executing the query",
    };
  }
}

// define function to DELETE privious client profile pic image file from server
async function deletePreviousFreelancerProfilePic(previousProfilePicName) {
  try {
    // logic to delete previous client profile pic
    const pathToPrevProfilePic = `./public/uploads/freelancerProfileImages/${previousProfilePicName}`;
    // const pathToPrevProfilePic = `/public/uploads/clientProfileImages/${previousProfilePicName}`;

    // Check if the file exists
    await fs.promises.access(pathToPrevProfilePic);

    // If it exists, delete it
    await fs.promises.unlink(pathToPrevProfilePic);

    // If successful, return success flag with a message
    return {
      success: true,
      message: "Previous profile picture deleted successfully.",
    };
  } catch (error) {
    // If there is an error, return failure flag with an error message
    console.log(
      "error in deleting previouse client profile pic: ",
      error.message
    );
    return {
      success: false,
      message: `Failed to delete previous profile picture: ${error.message}`,
    };
  }
}

// define function to get previouse client profile pic name
async function getPreviousFreelancerProfilePicName(userID) {
  const selectStatement =
    "SELECT profile_pic_as_freelancer FROM " +
    process.env.MYSQL_DB_NAME +
    ".users WHERE idusers = ?;";
  try {
    const queryExuectionResponse = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      selectStatement,
      [userID]
    );
    return queryExuectionResponse[0][0].profile_pic_as_freelancer;
  } catch (error) {
    console.log(
      "Error occured while trying to get previous profile_pic_as_client : ",
      error
    );
    return false;
  }
}

// define a POST route to handle file uploads
router.post(
  "/:idusers",
  auth,
  (req, res, next) => {
    //cross check if user is logged in and is requesting to change her own profile
    // if the user is not logged in or provided invalid jwt then dont allow her to upload profile pic
    if (req.user == "notLoggedIn" || req.user == "invalidToken") {
      return res
        .status(401)
        .json({ error: "You are not authorized!", "req.user": req.user });
    }

    // don't allow user to change someone else's profile pic
    const userIdOnURL = req.params.idusers;
    const userIdOnJWT = req.user.idusers;
    if (userIdOnURL != userIdOnJWT) {
      return res.status(401).json({ error: "You are not authorized!" });
    }

    // call the upload middleware only if the user is authorized
    upload.single("avatar")(req, res, function (err) {
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
          "Error occured while uploading freelancer profile pic = ",
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

      // UPDATE profile_pic_as_freelancer colomn in database and delete previous client profile pic
      const imageName = `${req.file.filename}`; //FIXME: give custom name to uploaded file
      const userID = req.params.idusers;
      const previousProfilePicName = await getPreviousFreelancerProfilePicName(
        userID
      );

      const result = await updateProfilePicAsFreelancerColoumnInDatabase(
        imageName,
        userID
      );

      // don't attepmt to delete previous profile pic if previousProfilePicName is not available
      if (previousProfilePicName != false || previousProfilePicName != "") {
        const deleteResponse = await deletePreviousFreelancerProfilePic(
          previousProfilePicName
        );
        // if could not delete the previous file
        if (!deleteResponse.success)
          console.log("Could not delete previous freelancer profile pic");
      }

      // send response to frontend on success
      if (result.success) return res.send(imageName);

      // could not UPDATE the database so handle the situation
      // send response to frontend on failure
      res.status(500).json({ error: "could not update the database!" });
    } catch (error) {
      // console.error("Failed to upload avatar:", error);
      console.log("Failed to upload freelancer avatar:", error);
      res.status(500).send("Failed to upload freelancer avatar");
    }
  }
);

module.exports = router;
