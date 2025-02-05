import 'dotenv/config'; 
import mysql from 'mysql2/promise';

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    timezone: '+9:00',
    waitForConnections: true,
    connectionLimit: 100, // 최대 연결 수
    queueLimit: 0, // 대기열 제한 (0은 제한 없음)
});

// 연결 테스트
(async () => {
    try {
        const conn = await connection.getConnection(); // Promise 기반으로 연결
        console.log('데이터베이스 연결 완료'.green);
        conn.release(); // 연결 해제
    } catch (err) {
        console.error('데이터베이스 연결 실패 :'.red, err.stack);
    }
})();


export default {connection};
