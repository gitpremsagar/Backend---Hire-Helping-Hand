require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    //there is no token in the header it means user has not logged in
    req.user = "notLoggedIn";
    next();
  }

  // console.log("token = ", token);

  try {
    // decode the jwt token
    const decodedValidToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

    // no error thrown up until now, this means token is valid now check the following
    // TODO: 1. check if the user has verfied her email. If not then notify frontend and redirect the user to email verification page
    // TODO: 2. if the email used by user is reported as spam sign up then notify frontend and redirect the user to chagne email page

    req.user = decodedValidToken;
    next();
  } catch (exception) {
    // following code run only if token is invalid
    req.user = "invalidToken"; //res.status(400).send("Invalid token!");
    next();
  }
};
