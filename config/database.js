import "dotenv/config"; // dotenv를 import 방식으로 불러옴
import mysql from "mysql2";

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
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

export default connection;