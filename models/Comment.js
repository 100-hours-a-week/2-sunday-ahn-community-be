import db from '../config/database.js';

const Comment = {
    // 모든 댓글 가져오기 (작성자 정보 포함)
    getAllComments: async () => {
        try {
            const query = `
                SELECT Comment.*, User.user_id AS author_user_id, User.nickname AS author_nickname, User.profile_image AS author_profile_image
                FROM Comment
                JOIN User ON Comment.user_id = User.user_id
                ORDER BY Comment.date DESC
            `;
            const [results] = await db.promise().query(query);
            return results;
        } catch (error) {
            throw error;
        }
    },

    // 댓글 추가하기
    createComment: async (user_id, post_id, content) => {
        const query =
            'INSERT INTO Comment (user_id, post_id, content) VALUES (?, ?, ?)';
        try {
            const [results] = await db
                .promise()
                .query(query, [user_id, post_id, content]);
            return results.insertId; // 새로 생성된 댓글 ID 반환
        } catch (error) {
            throw error;
        }
    },

    // 특정 댓글 가져오기 (작성자 정보 포함)
    getCommentById: async comment_id => {
        try {
            const query = `
                SELECT Comment.*, User.user_id AS author_user_id, User.nickname AS author_nickname, User.profile_image AS author_profile_image
                FROM Comment
                JOIN User ON Comment.user_id = User.user_id
                WHERE Comment.comment_id = ?
            `;
            const [results] = await db.promise().query(query, [comment_id]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    // 댓글 수정하기
    updateComment: async (comment_id, content) => {
        const query = 'UPDATE Comment SET content = ? WHERE comment_id = ?';
        try {
            const [results] = await db
                .promise()
                .query(query, [content, comment_id]);
            return results.affectedRows; // 수정된 행 수 반환
        } catch (error) {
            throw error;
        }
    },

    // 댓글 삭제하기
    deleteComment: async comment_id => {
        try {
            const [results] = await db
                .promise()
                .query('DELETE FROM Comment WHERE comment_id = ?', [
                    comment_id,
                ]);
            return results.affectedRows; // 삭제된 행 수 반환
        } catch (error) {
            throw error;
        }
    },
};

export default Comment;
