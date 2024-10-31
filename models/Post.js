const db = require('../config/database');

const Post = {
    // 모든 게시물 가져오기
    getAllPosts: (callback) => {
        db.query('SELECT * FROM Post', (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    // 게시물 추가하기
    createPost: (title, content, likes, views, date, img_url, user_id, callback) => {
        const query = 'INSERT INTO Post (title, content, likes, views, date, img_url, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [title, content, likes, views, date, img_url, user_id], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results.insertId);
        });
    },

    // 특정 게시물 가져오기
    getPostById: (id, callback) => {
        db.query('SELECT * FROM Post WHERE id = ?', [id], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results[0]);
        });
    },

    // 게시물 수정하기
    updatePost: (id, title, content, likes, views, date, img_url, user_id, callback) => {
        const query = 'UPDATE Post SET title = ?, content = ?, likes = ?, views = ?, date = ?, img_url = ?, user_id = ? WHERE id = ?';
        db.query(query, [title, content, likes, views, date, img_url, user_id, id], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results.affectedRows);
        });
    },

    // 게시물 삭제하기
    deletePost: (id, callback) => {
        db.query('DELETE FROM Post WHERE id = ?', [id], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results.affectedRows);
        });
    }
};

module.exports = Post;
