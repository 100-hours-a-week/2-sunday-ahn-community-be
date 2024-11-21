import db from '../config/database.js';

const User = {
    // 모든 사용자 가져오기
    getAllUsers: async () => {
        try {
            const [results] = await db.promise().query('SELECT * FROM User');
            return results;
        } catch (error) {
            throw error;
        }
    },

    // 사용자 추가하기
    createUser: async (email, password, nickname, profile_image) => {
        const query = 'INSERT INTO User (email, password, nickname, profile_image) VALUES (?, ?, ?, ?)';
        try {
            const [results] = await db.promise().query(query, [email, password, nickname, profile_image]);
            return results.insertId;
        } catch (error) {
            throw error;
        }
    },

    // 특정 사용자 가져오기 (ID 기반)
    getUserById: async (user_id) => {
        try {
            const [results] = await db.promise().query('SELECT * FROM User WHERE user_id = ?', [user_id]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    // 이메일로 사용자 조회
    getUserByEmail: async (email) => {
        const query = 'SELECT * FROM User WHERE email = ?';
        try {
            const [results] = await db.promise().query(query, [email]);
            return results[0]; // 이메일에 해당하는 첫 번째 사용자 반환
        } catch (error) {
            throw error;
        }
    },

    // 닉네임으로 사용자 조회
    getUserByNickname: async (nickname) => {
        const query = 'SELECT * FROM User WHERE nickname = ?';
        try {
            const [results] = await db.promise().query(query, [nickname]);
            return results[0]; // 닉네임에 해당하는 첫 번째 사용자 반환
        } catch (error) {
            throw error;
        }
    },

    // 사용자 수정하기
    updateUser: async (user_id, email, password, nickname, profile_image) => {
        const query = 'UPDATE User SET email = ?, password = ?, nickname = ?, profile_image = ? WHERE user_id = ?';
        try {
            const [results] = await db.promise().query(query, [email, password, nickname, profile_image, user_id]);
            return results.affectedRows;
        } catch (error) {
            throw error;
        }
    },

    // 사용자 삭제하기
    deleteUser: async (user_id) => {
        try {
            const [results] = await db.promise().query('DELETE FROM User WHERE user_id = ?', [user_id]);
            return results.affectedRows;
        } catch (error) {
            throw error;
        }
    }
};

export default User;
