require("dotenv").config();
const express = require("express");
const route = express.Router();
const { checkSchema, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const makeQueryToDatabase = require("../src/queryDB");

//shecema to validate user posted data against set schema while siging up an user
const newUserSchema = {
  tAndC: {
    custom: {
      options: (value) => {
        if (value === true) {
          return Promise.resolve();
        } else {
          return Promise.reject("Please accept terms and conditions.");
        }
      },
    },
  },
  firstname: {
    isLength: {
      errorMessage: "First name must be between 1 to 50 characters long.",
      options: {
        min: 1,
        max: 50,
      },
    },
  },
  lastname: {
    isLength: {
      errorMessage: "Last name must be between 1 to 50 characters long.",
      options: {
        min: 1,
        max: 50,
      },
    },
  },
  password: {
    isLength: {
      errorMessage: "Password must be at least 6 characters long.",
      options: {
        min: 6,
        max: 254,
      },
    },
  },
  confirmPassword: {
    isLength: {
      errorMessage: "You must confirm your password!",
      options: {
        min: 6,
        max: 255,
      },
    },
  },
  email: {
    isEmail: {
      bail: true,
    },
  },
};

//========= handling all post requests  ===========

//====== Route for signing up user =======
route.post("/", checkSchema(newUserSchema), async (req, res) => {
  //-------------- Validating user input ------------

  //validation result after checking user input aginst the set schema
  const validationError = validationResult(req);
  if (!validationError.isEmpty()) {
    res.status(400).send(validationError);
    return;
  }
  if (req.body.password != req.body.confirmPassword) {
    res.status(400).send("Password mismatch.");
    return;
  }

  //check if any user is already regitered with same email
  const selectStatementForGivenEmail = `SELECT ${process.env.TABLE_NAME_OF_USERS}.*
  FROM ${process.env.TABLE_NAME_OF_USERS}
  WHERE ${process.env.TABLE_NAME_OF_USERS}.email = ? LIMIT 1;`;

  const selectQueryResponse = await makeQueryToDatabase(
    process.env.MYSQL_DB_NAME,
    selectStatementForGivenEmail,
    [req.body.email]
  );

  if (selectQueryResponse[0][0]) {
    res.status(400).send("AlreadyRegistered");
    return;
  }

  //========== register user ===========
  const { firstname, lastname, email, password } = req.body;
  const userIP = req.ip;
  const currentTimestamp = Math.round(+new Date() / 1000);

  //==== hashing password ====
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //-------- Inserting new user data into database --------
  try {
    const insertStatementToRegisterUser =
      "INSERT INTO `" +
      process.env.MYSQL_DB_NAME +
      "`.`" +
      process.env.TABLE_NAME_OF_USERS +
      "` (`first_name`, `last_name`, `email`, `password`, `signup_date`, `signup_ip`, `profile_pic_name`, `last_seen`, `user_type`, `phone_no`, `user_name`) VALUES (?, ?, ?, ?, ?, ?, '', '', 'user', '', '');";

    const insertQueryResponse = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      insertStatementToRegisterUser,
      [firstname, lastname, email, hashedPassword, currentTimestamp, userIP]
    );
    console.log("Insert query ran.");
    res.status(200).send(insertQueryResponse);
  } catch (error) {
    console.log("error in running query = ", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = route;
