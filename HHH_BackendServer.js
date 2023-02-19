require("dotenv").config();
const express = require("express");
const cors = require("cors");

//importing all route handlers
const users = require("./routes/users.js");
const decodeToken = require("./routes/decodeToken.js");
const reportSpamSignup = require("./routes/reportSpamSignup.js");
const verifyEmail = require("./routes/verifyEmail.js");
const handleSearch = require("./routes/handleSearch.js");

const app = express();

app.use("/public", express.static("public"));
app.use(express.json());
app.use(cors());
const corsOptions = { exposedHeaders: "x-auth-token" };
app.use(cors(corsOptions));

//assigning route handlers to the routes
app.use("/api/users", users); //handles user sign up and login
app.use("/api/report-spam-signup", reportSpamSignup);
app.use("/api/authenticate", decodeToken);
app.use("/api/verify/email", verifyEmail);
app.use("/api/search", handleSearch);

//listening
const portNumberOnLocalHost = process.env.LISTENING_PORT_OF_HHH_BACKEND_SERVER;
app.listen(process.env.PORT || portNumberOnLocalHost, () => {
  console.log(`HHH-backend is runnung on port ${portNumberOnLocalHost}`);
});

//FIXME:
// 1. /routes/users.js
// 2. TODO: create route service-offers
