import express from "express";
import moment from "moment";
import "colors";
import db from "./config/database.js"

const app = express();
const port = 3000;

// 미들웨어 - SQL 쿼리 로그 출력
const logQuery = (sqlQuery) => {
    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
    console.log(`[${currentTime.yellow}] ${sqlQuery.blue}`);
};

// 사용자 조회 API
app.get("/users", (req, res) => {
    const sqlQuery = "SELECT * FROM user";
    logQuery(sqlQuery);

    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error("쿼리 실행 오류:".red, err);
            res.status(500).send("서버 오류");
            return;
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`.yellow);
});
