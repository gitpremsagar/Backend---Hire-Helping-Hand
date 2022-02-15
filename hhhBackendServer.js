const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to HHH backend");
});

const portNumberOnLocalHost = 4040;
app.listen(process.env.PORT || portNumberOnLocalHost, () => {
  console.log(`HHH-backend is runnung on port ${portNumberOnLocalHost}`);
});
