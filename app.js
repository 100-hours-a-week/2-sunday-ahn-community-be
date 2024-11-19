const express = require('express');
const timeout = require('connect-timeout');
const rateLimit = require("express-rate-limit");
const helmet = require('helmet');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();

const PORT = process.env.PORT || 3000;
const userRoutes = require('./routers/userRouter'); // userRoutes 불러오기
const postRoutes = require('./routers/postRouter'); // postRoutes 불러오기
const commonRoutes = require('./routers/commonRouter'); // commonRouter 불러오기
const commentRoutes = require('./routers/commentRouter'); // commentsRouter 불러오기

// cors정책에 막혀서 미들웨어 설정
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:2000', // 클라이언트 URL
    credentials: true,
}));


// 컨텐츠 보안 정책
app.use(helmet());
app.disable('x-powered-by');

// express-rate-limit
app.use(rateLimit({ 
    windowMs: 60 * 1000, // 1분 간격 
    max: 100, // 최대 호출 횟수
    handler(req, res) { // 제한 초과 시 콜백 함수 
        res.status(this.statusCode).json({
            code: this.statusCode,
            message: '1분에 100번만 요청 할 수 있습니다.',
        });
    },
}));

// 타임아웃 미들웨어 사용
app.use(timeout('5s'));

// 타임아웃 처리 미들웨어
app.use((req, res, next) => {
    if (req.timedout) {
        return res.status(503).json({ message: '요청이 시간 내에 완료되지 않았습니다.' });
    }
    next();
});

// JSON과 URL 인코딩된 요청 본문 제한 크기 설정
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cookieParser());
// 세션 미들웨어 설정
app.use(session({
    secret: 'git_secret', // 세션 암호화 키인데 나중에 git secret key 설정하기...
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, // 클라이언트에서 세션 쿠키를 수정하지 못하도록 함
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 // 쿠키 유효 기간 (1일)
    }
}));

// 인증 미들웨어
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

app.use('/auth', commonRoutes)
app.use('/users', userRoutes); 
app.use('/posts', postRoutes); 
app.use('/comments', commentRoutes); 

app.listen(PORT, () => {
    console.log(`${PORT}에서 서버 실행 중`);
});
