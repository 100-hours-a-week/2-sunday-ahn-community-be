require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const moment = require("moment");
const colors = require("colors");

const app = express();
const port = 3000;

// MySQL 연결 설정
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:".red, err);
        return;
    }
    console.log("Database connected!".green);
});

// 미들웨어 - 요청 시 SQL 쿼리와 시간을 로그로 출력
const logQuery = (sqlQuery) => {
    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
    console.log(`[${currentTime.yellow}] ${sqlQuery.blue}`);
};

app.get("/users", (req, res) => {
  const sqlQuery = "SELECT * FROM user";
  logQuery(sqlQuery); // SQL 쿼리와 요청 시간을 콘솔에 출력

db.query(sqlQuery, (err, results) => {
    if (err) {
        console.error("Error executing query:".red, err);
        res.status(500).send("Server Error");
        return;
    }
    res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`.yellow);
});
