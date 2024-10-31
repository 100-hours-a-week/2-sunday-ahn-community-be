const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json()); // JSON 형식의 요청 본문을 파싱

const usersFilePath = path.join(__dirname, '../config/users.json'); // 사용자 데이터 파일 경로

// 게시물 수정 
exports.editInfo = (req, res) => {
    
};