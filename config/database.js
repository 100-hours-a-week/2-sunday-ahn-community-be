import 'dotenv/config'; 
import mysql from 'mysql2';

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 100, // 최대 연결 수
    queueLimit: 0, // 대기열 제한 (0은 제한 없음)
});

connection.getConnection(err => {
    if (err) {
        console.error('데이터베이스 연결실패 :'.red, err.stack);
        return;
    }
    console.log('데이터베이스 연결 완료'.green);
});

export default connection;
