require("dotenv").config();
const express = require("express");
const cors = require("cors");

//importing all route handlers
const users = require("./routes/users.js");

const app = express();

app.use("/public", express.static("public"));
app.use(express.json());
app.use(cors());

//assigning route handlers to the routes
app.use("/api/users", users);

//listening
const portNumberOnLocalHost = process.env.LISTENING_PORT_OF_HHH_BACKEND_SERVER;
app.listen(process.env.PORT || portNumberOnLocalHost, () => {
  console.log(`HHH-backend is runnung on port ${portNumberOnLocalHost}`);
});
