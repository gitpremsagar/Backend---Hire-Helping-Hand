require("dotenv").config();
const mysql = require("mysql2/promise");

async function makeQueryToDatabase(dbName, queryStatement, valuesArray) {
  //create connection to MySql database
  const connection = await mysql.createConnection({
    user: process.env.MYSQL_DB_USER_NAME,
    host: process.env.MYSQL_DB_HOST,
    password: process.env.MYSQL_DB_USER_PASSWORD,
    port: process.env.MYSQL_DB_PORT,
    database: dbName,
  });

  //execute the passed queryStatement
  const response = connection.execute(queryStatement, valuesArray);
  connection.end();
  return response;
}

module.exports = makeQueryToDatabase;
