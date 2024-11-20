const mysql = require('mysql2');
require("dotenv").config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

connection.connect((err) => {
    if (err) {
        console.error('데이터베이스 연결실패 :'.red, err.stack);
        return;
    }
    console.log('데이터베이스 연결 완료'.green);
});

module.exports = connection;