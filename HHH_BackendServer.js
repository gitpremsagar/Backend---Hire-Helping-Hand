require("dotenv").config();
const express = require("express");

//importing all route handlers
const loginRouteHandler = require("./routes/loginRouteHandler.js");
const signupRouteHandler = require("./routes/signupRouteHandler.js");

const app = express();

app.use("/public", express.static("public"));
app.use(express.json());

//assigning route handlers to the routes
app.use("/api/login", loginRouteHandler);
app.use("/api/signup", signupRouteHandler);

//listening
const portNumberOnLocalHost = process.env.LISTENING_PORT_OF_HHH_BACKEND_SERVER;
app.listen(process.env.PORT || portNumberOnLocalHost, () => {
  console.log(`HHH-backend is runnung on port ${portNumberOnLocalHost}`);
});
