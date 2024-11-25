## 커뮤니티 만들기 과제<br>
커뮤니티 BE 입니다.
#### 실행방법<br>
npm start

## 기술 리스트
![AWS-RDS](https://img.shields.io/badge/AWS-RDS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)

## 회고<br>
기간내에 끝내고 싶었지만 1주차때 너무 많이 물려있었다..nodemon과 세션에 대해 좀 더 알았다면 간단하게 끝낼 수 있었던 부분이 너무 아쉽다..어떠한 기술을 사용할 때 정확하게 알고 써야한다는 것을 알고있었지만 실행에 옮기지않았던거같다. 앞으로는 사용하는 기술에 대해 조금이라도 더 조사하고 사용해야겠다...😭


---

#### 앞으로 예정
- 최적화
- ec2 배포

### 1주차와 비교<br>
- date를 DB에 데이터가 도착했을 때 설정
- author의 정보들을 받는것을 작성자의 userId로 조회하여 나머지 nickname, profileImage 조회

### 작업현황<br>

#### GET
- [x] /users/logout/{userId} 유저 로그아웃
- [x] /posts/{postId} 게시물 상세조회
- [x] /posts 게시물 리스트 조회

#### POST
- [x] /auth/nickname 닉네임 중복 검사
- [x] /posts 게시물 등록
- [x] /comments 댓글 등록
- [x] /auth/regist 유저 회원가입
- [x] /auth/login 유저 로그인
- [x] /auth/email 이메일 중복 검사

#### PUT
- [x] /comments/{commentId} 댓글 수정
- [x] /posts/{postId} 게시물수정
- [x] /users/profileImg/{userId} 유저 프로필 이미지 변경

#### PATCH
- [x] /users/password/{userId} 비밀번호 수정
- [x] /users/nickname/{userId} 닉네임 수정

#### DELETE
- [x] /users/withdraw/{userId} 유저 회원 탈퇴
- [x] /comments/{commentId} 댓글삭제
- [x] /posts/{postId} 게시물 삭제
