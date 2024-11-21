import db from '../config/database.js';

const User = {
    // 모든 사용자 가져오기
    getAllUsers: (callback) => {
        db.query('SELECT * FROM User', (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    // 사용자 추가하기
    createUser: (email, password, nickname, profile_image, callback) => {
        const query = 'INSERT INTO User (email, password, nickname, profile_image) VALUES (?, ?, ?, ?)';
        db.query(query, [email, password, nickname, profile_image], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results.insertId);
        });
    },

    // 특정 사용자 가져오기 (ID 기반)
    getUserById: (user_id, callback) => {
        db.query('SELECT * FROM User WHERE user_id = ?', [user_id], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results[0]);
        });
    },

    // 이메일로 사용자 조회
    getUserByEmail: (email, callback) => {
        const query = 'SELECT * FROM User WHERE email = ?';
        db.query(query, [email], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results[0]); // 이메일에 해당하는 첫 번째 사용자 반환
        });
    },

    // 닉네임으로 사용자 조회
    getUserByNickname: (nickname, callback) => {
        const query = 'SELECT * FROM User WHERE nickname = ?';
        db.query(query, [nickname], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results[0]); // 닉네임에 해당하는 첫 번째 사용자 반환
        });
    },

    // 사용자 수정하기
    updateUser: (user_id, email, password, nickname, profile_image, callback) => {
        const query = 'UPDATE User SET email = ?, password = ?, nickname = ?, profile_image = ? WHERE user_id = ?';
        db.query(query, [email, password, nickname, profile_image, user_id], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results.affectedRows);
        });
    },

    // 사용자 삭제하기
    deleteUser: (user_id, callback) => {
        db.query('DELETE FROM User WHERE user_id = ?', [user_id], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results.affectedRows);
        });
    }
};

export default User;
