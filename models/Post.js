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
    createPost: (user_id, title, content, likes, views, comments_cnt, date, image_url, callback) => {
        const query = 'INSERT INTO Post (user_id, title, content, likes, views, comments_cnt, date, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [user_id, title, content, likes, views, comments_cnt, date, image_url], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results.insertId);
        });
    },

    // 특정 게시물 가져오기
    getPostById: (post_id, callback) => {
        db.query('SELECT * FROM Post WHERE post_id = ?', [post_id], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results[0]);
        });
    },

    // 게시물 수정하기
    updatePost: (post_id, user_id, title, content, likes, views, comments_cnt, date, image_url, callback) => {
        const query = 'UPDATE Post SET user_id = ?, title = ?, content = ?, likes = ?, views = ?, comments_cnt = ?, date = ?, image_url = ? WHERE post_id = ?';
        db.query(query, [user_id, title, content, likes, views, comments_cnt, date, image_url, post_id], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results.affectedRows);
        });
    },

    // 게시물 삭제하기
    deletePost: (post_id, callback) => {
        db.query('DELETE FROM Post WHERE post_id = ?', [post_id], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results.affectedRows);
        });
    }
};

module.exports = Post;
