import db from '../config/database.js';

const Post = {
    // 모든 게시물 가져오기
    getAllPosts: async () => {
        try {
            const query = `
                SELECT Post.*, User.user_id AS author_user_id, User.nickname AS author_nickname, User.profile_image AS author_profile_image
                FROM Post
                JOIN User ON Post.user_id = User.user_id
                ORDER BY Post.date DESC
            `;
            const [results] = await db.promise().query(query);
            return results;
        } catch (error) {
            throw error;
        }
    },

    // 게시물 추가하기
    createPost: async (
        user_id,
        title,
        content,
        likes,
        views,
        comments_cnt,
        image_url,
    ) => {
        const query = `
            INSERT INTO Post (user_id, title, content, likes, views, comments_cnt, image_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        try {
            const [results] = await db
                .promise()
                .query(query, [
                    user_id,
                    title,
                    content,
                    likes,
                    views,
                    comments_cnt,
                    image_url,
                ]);
            return results.insertId;
        } catch (error) {
            throw error;
        }
    },

    // 특정 게시물 가져오기
    getPostById: async post_id => {
        try {
            const query = `
                SELECT Post.*, User.user_id AS author_user_id, User.nickname AS author_nickname, User.profile_image AS author_profile_image
                FROM Post
                JOIN User ON Post.user_id = User.user_id
                WHERE post_id = ?
            `;
            const [results] = await db.promise().query(query, [post_id]);
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    // 게시물 수정하기
    updatePost: async (
        post_id,
        user_id,
        title,
        content,
        likes,
        views,
        comments_cnt,
        image_url,
    ) => {
        const query = `
            UPDATE Post 
            SET user_id = ?, title = ?, content = ?, likes = ?, views = ?, comments_cnt = ?, image_url = ? 
            WHERE post_id = ?
        `;
        try {
            const [results] = await db
                .promise()
                .query(query, [
                    user_id,
                    title,
                    content,
                    likes,
                    views,
                    comments_cnt,
                    image_url,
                    post_id,
                ]);
            return results.affectedRows;
        } catch (error) {
            throw error;
        }
    },

    // 게시물 삭제하기
    deletePost: async post_id => {
        try {
            const [results] = await db
                .promise()
                .query('DELETE FROM Post WHERE post_id = ?', [post_id]);
            return results.affectedRows;
        } catch (error) {
            throw error;
        }
    },
};

export default Post;
