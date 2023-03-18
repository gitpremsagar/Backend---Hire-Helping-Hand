require("dotenv").config();
const express = require("express");
const route = express.Router();
const { checkSchema, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const makeQueryToDatabase = require("../src/queryDB");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const {
  getVerificationEmailHTML,
  getVerificationEmailPlainText,
} = require("../src/modules/users/generateVerificationEmail");
const {
  suspiciousSignupNotifyingLink,
} = require("../src/modules/envVariables/envVariables");
const crypto = require("crypto");
const auth = require("../middlewares/auth");

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

const loginUserSchema = {
  password: {
    isLength: {
      errorMessage: "Password cannot be empty!",
      options: {
        min: 1,
      },
    },
  },
  email: {
    isEmail: {
      errorMessage: "Invalid email",
      bail: true,
    },
  },
};

//========= handling all post requests  ===========

// CREATE
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
  try {
    const selectQueryResponse = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      selectStatementForGivenEmail,
      [req.body.email]
    );

    //check if this user is already registered or not
    if (selectQueryResponse[0][0]) {
      res.status(400).send("AlreadyRegistered");
      return;
    }

    //========== register this new user ===========
    const { firstname, lastname, email, password } = req.body;
    const userIP = req.ip;
    const currentTimestamp = Math.round(+new Date() / 1000);

    //==== hashing password ====
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //------generate verification__details to be inserted in the query----------
    const generateVerificationCode = () => {
      // generates a random 4-digit code to email to the signing up user
      return Math.floor(1000 + Math.random() * 9000);
    };
    const verificationCode = generateVerificationCode();

    // creating verification details in json format to store it to database
    const verificationDetails = {
      isEmailVerified: false,
      emailVerificationCode: verificationCode,
    };
    const verificationDetailsString = JSON.stringify(verificationDetails);

    // ------ to detect spam sign up -----------
    const spamSignupDetectionToken = crypto.randomBytes(32).toString("hex"); // generate spam detection token
    const spamSignupNotifyingLink = `${suspiciousSignupNotifyingLink}?spamSignupDetectionToken=${spamSignupDetectionToken}`;

    //-------- Inserting new user data into database --------
    const insertStatementToRegisterUser =
      "INSERT INTO `" +
      process.env.MYSQL_DB_NAME +
      "`.`" +
      process.env.TABLE_NAME_OF_USERS +
      "` (`first_name`, `last_name`, `email`, `password`, `signup_date`, `signup_ip`, `profile_pic_name`, `last_seen`, `user_type`, `phone_no`, `user_name`,`verification_details`,`spam_signup_detection_token`) VALUES (?, ?, ?, ?, ?, ?, '', '', 'user', '', '',?,?);";

    const insertQueryResponse = await makeQueryToDatabase(
      process.env.MYSQL_DB_NAME,
      insertStatementToRegisterUser,
      [
        firstname,
        lastname,
        email,
        hashedPassword,
        currentTimestamp,
        userIP,
        verificationDetailsString,
        spamSignupDetectionToken,
      ]
    );
    console.log("Insert query ran.");

    const sendVerificationCode = async (email) => {
      try {
        const smtpSecure = process.env.SMTP_SECURE === "true"; // Parse 'true' or 'false' string into boolean value
        // create a transporter using nodemailer
        let transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOSTNAME,
          port: process.env.SMTP_PORT,
          secure: smtpSecure,
          auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
          },
        });

        // send email with the generated verification code

        const smtpFromName = process.env.SMTP_FROM_NAME; // to make sure to include the quotation marks around white space

        const verificationEmailPlainText = getVerificationEmailPlainText(
          firstname,
          verificationCode,
          spamSignupNotifyingLink
        );
        const verificationEmailHTML = getVerificationEmailHTML(
          firstname,
          verificationCode,
          spamSignupNotifyingLink
        );
        let info = await transporter.sendMail({
          from: `"${smtpFromName}" <${process.env.SMTP_FROM_EMAIL}>`,
          to: email,
          subject: "Please verify your email to complete registration!",
          text: verificationEmailPlainText,
          html: verificationEmailHTML,
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      } catch (err) {
        console.error("Email not sent!");
        console.error(err);
      }
    };
    sendVerificationCode(email);

    res.status(200).send(insertQueryResponse);
  } catch (error) {
    console.log("error in running query = ", error);
    res.status(500).send("Internal server error");
  }
});

// ======== Route for logging in user ======
route.post("/login", checkSchema(loginUserSchema), async (req, res) => {
  //validate user inputs
  const errors = validationResult(req);
  //if user submitted data is not valid then send invalid data message array to client
  if (!errors.isEmpty()) return res.status(400).send(errors.array());

  const { email, password, rMe } = req.body;
  const userIP = req.ip;
  const unixTimestamp = Math.round(+new Date() / 1000);
  const dbName = process.env.MYSQL_DB_NAME;
  const usersTable = process.env.TABLE_NAME_OF_USERS;
  const selectStatement = `SELECT ${usersTable}.* FROM ${usersTable} WHERE ${usersTable}.email = ? LIMIT 1;`;
  const queryResponse = await makeQueryToDatabase(dbName, selectStatement, [
    email,
  ]);

  try {
    // check if user with this email exists
    if (!queryResponse[0][0]) return res.status(400).send("emailPasswordWrong");

    // check if password provided by user is correct or not
    const validPassword = await bcrypt.compare(
      password,
      queryResponse[0][0].password
    );
    if (!validPassword) return res.status(400).send("passwordEmailWrong");

    //create JWT token
    const token = jwt.sign(
      {
        idusers: queryResponse[0][0].idusers,
        first_name: queryResponse[0][0].first_name,
        last_name: queryResponse[0][0].last_name,
      },
      process.env.JWT_PRIVATE_KEY
    );

    //TODO: update last seen and last login ip status in database

    //TODO: if rMe is true then remember this user on this device so that she doesn't need to login again and again

    //since there's no error upto this point so send response with token
    res.header("x-auth-token", token).status(200).send("loggedIn");
  } catch (error) {
    console.log("the error is ", error);
    res.status(500).send("Problem in server!");
  }
});

// READ
// ========= Route for GETTING user information ========
route.get("/:idusers", async (req, res) => {
  // extracting idusers from url
  const userIdOnURL = req.params.idusers;
  try {
    // getting user info from database with given idusers
    // FIXME: select only required colomns
    let sql = `select * from ${process.env.MYSQL_DB_NAME}.users WHERE idusers = ?`;
    const response = await makeQueryToDatabase(process.env.MYSQL_DB_NAME, sql, [
      userIdOnURL,
    ]);

    // sending all the informations available
    res.send(response[0]);
  } catch (error) {
    console.log("Error in making query = ", error);
    res.status(500).json({ error: "error in executing query!" });
  }
});

// UPDATE
// ========= Route for UPDATING user information ========
route.put("/:idusers", auth, (req, res) => {
  //if provided token is invalid then send 400 status code
  if (req.user === "invalidToken") return res.status(400).send("invalidToken");

  res.json({ iduser: req.params.idusers, "req.user": req.user });
});

// DELETE
// TODO: code route to handle user removal request

module.exports = route;

// TODO: comment out all console logs
