const db = require('../config/database');

const Comment = {
    // 모든 댓글 가져오기
    getAllComments: (callback) => {
        db.query('SELECT * FROM Comment', (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    // 댓글 추가하기
    createComment: (user_id, post_id, content, date, callback) => {
        const query = 'INSERT INTO Comment (user_id, post_id, content, date) VALUES (?, ?, ?, ?)';
        db.query(query, [user_id, post_id, content, date], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results.insertId);
        });
    },

    // 특정 댓글 가져오기
    getCommentById: (id, callback) => {
        db.query('SELECT * FROM Comment WHERE id = ?', [id], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results[0]);
        });
    },

    // 댓글 수정하기
    updateComment: (id, user_id, post_id, content, date, callback) => {
        const query = 'UPDATE Comment SET user_id = ?, post_id = ?, content = ?, date = ? WHERE id = ?';
        db.query(query, [user_id, post_id, content, date, id], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results.affectedRows);
        });
    },

    // 댓글 삭제하기
    deleteComment: (id, callback) => {
        db.query('DELETE FROM Comment WHERE id = ?', [id], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results.affectedRows);
        });
    }
};

module.exports = Comment;
