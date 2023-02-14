require("dotenv").config();
const express = require("express");
const cors = require("cors");

//importing all route handlers
const users = require("./routes/users.js");
const decodeToken = require("./routes/decodeToken.js");

const app = express();

app.use("/public", express.static("public"));
app.use(express.json());
app.use(cors());
const corsOptions = { exposedHeaders: "x-auth-token" };
app.use(cors(corsOptions));

//assigning route handlers to the routes
app.use("/api/users", users);
app.use("/api/authenticate", decodeToken);

//listening
const portNumberOnLocalHost = process.env.LISTENING_PORT_OF_HHH_BACKEND_SERVER;
app.listen(process.env.PORT || portNumberOnLocalHost, () => {
  console.log(`HHH-backend is runnung on port ${portNumberOnLocalHost}`);
});

//FIXME:
// 1. /routes/users.js
// 2. TODO: create route service-offers