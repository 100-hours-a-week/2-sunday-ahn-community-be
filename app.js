import express from 'express';
import timeout from 'connect-timeout';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import moment from "moment";
import "colors";

import db from "./config/database.js"
import userRoutes from './routers/userRouter.js';
import postRoutes from './routers/postRouter.js';
import commentRoutes from './routers/commentRouter.js';
import commonRoutes from './routers/commonRouter.js';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 정책 설정
app.use(cors({
    origin: 'http://localhost:2000', // 클라이언트 URL
    credentials: true,
}));

// 보안 헤더 추가
app.use(helmet());
app.disable('x-powered-by');

// rate-limit 설정 (1분에 100번 요청 가능)
app.use(rateLimit({ 
    windowMs: 60 * 1000, // 1분 간격
    max: 100, // 최대 호출 횟수
    handler: (req, res) => { // 제한 초과 시 콜백 함수 
        res.status(429).json({
            code: 429,
            message: '1분에 100번만 요청 할 수 있습니다.',
        });
    },
}));

// 타임아웃 미들웨어 설정
app.use(timeout('5s'));

// 타임아웃 처리 미들웨어
app.use((req, res, next) => {
    if (req.timedout) {
        return res.status(503).json({ message: '요청이 시간 내에 완료되지 않았습니다.' });
    }
    next();
});

// JSON 및 URL 인코딩된 요청 본문 제한 크기 설정
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 쿠키 파서 설정
app.use(cookieParser());

// 세션 미들웨어 설정
app.use(session({
    secret: 'git_secret', // 세션 암호화 키 (나중에 git secret key 설정 필요)
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, // 클라이언트에서 세션 쿠키를 수정하지 못하도록 함
        secure: false,  // true로 설정하려면 https 사용해야 함
        maxAge: 1000 * 60 * 60 * 24, // 쿠키 유효 기간 (1일)
    },
}));

// 인증 미들웨어 설정
const authMiddleware = (req, res, next) => {
    if (req.path.startsWith('/auth')) {
        return next(); // /auth 경로는 인증 불필요
    }
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }
    next();
};

app.use(authMiddleware);

// 라우팅 설정
app.use('/auth', commonRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);

// 서버 실행
app.listen(PORT, () => {
    console.log(`${PORT}에서 서버 실행 중`);
});
