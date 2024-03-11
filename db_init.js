require("dotenv").config();
const mysql = require("mysql2");
// console.log(process.env.MYSQL_HOST);
// console.log(process.env.MYSQL_PORT);
const connection = mysql.createPool({
  // host: process.env.MYSQL_HOST,
  // port: process.env.MYSQL_PORT,
  host: "localhost",
  port: "3306",
  user: "root",
  password: "-Kkhrudgks0102",
  database: "test",
  keepAliveInitialDelay: 10000,
  enableKeepAlive: true,
});
module.exports = connection;
