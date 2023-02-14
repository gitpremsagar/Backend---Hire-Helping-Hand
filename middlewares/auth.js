require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    //there is no token in the header it means user has not logged in
    req.user = "notLoggedIn"; //
    next();
  }

  try {
    const decodedValidToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    req.user = decodedValidToken;
    next();
  } catch (exception) {
    req.user = "invalidToken"; //res.status(400).send("Invalid token!");
    next();
  }
};
