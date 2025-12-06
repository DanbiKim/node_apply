# Node.js 웹 서버

팅팅팅 소개팅 가입 신청 페이지를 Node.js로 리뉴얼한 프로젝트입니다.

## 기능

- 약관 동의 및 본인 인증
- 프로필 입력 (거주지역, 직업, 학력, 취미 등)
- 프로필 사진 등록
- 소개팅 조건 설정
- 가입 정보 저장 및 SMS 발송

## 시작하기

### 설치

```bash
npm install
```

### 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 필요한 값을 설정하세요.

```bash
cp .env.example .env
```

### 실행

```bash
npm start
```

서버가 `http://localhost:3000`에서 실행됩니다.

## API 엔드포인트

### 가입 관련
- `POST /api/apply/check-phone` - 전화번호 중복 체크
- `POST /api/apply/register` - 가입 정보 저장
- `GET /api/apply/charm-list` - 매력/성격 리스트 조회
- `GET /api/apply/face-list` - 얼굴 타입 리스트 조회

### 기타
- `GET /` - 홈 페이지
- `GET /apply` - 가입 페이지
- `GET /health` - 서버 상태 확인

## 프로젝트 구조

```
.
├── server.js              # 메인 서버 파일
├── package.json           # 프로젝트 설정
├── config/
│   └── config.js          # 설정 파일
├── routes/
│   ├── api.js             # API 라우트
│   └── apply.js           # 가입 관련 라우트
├── controllers/
│   └── applyController.js # 가입 로직 컨트롤러
├── models/
│   └── userModel.js       # 사용자 데이터 모델
├── middleware/
│   ├── validation.js      # 입력 검증
│   └── fileUpload.js     # 파일 업로드 미들웨어
├── utils/
│   ├── db.js              # DB 연결
│   ├── encryption.js      # 암호화 유틸
│   └── sms.js             # SMS 발송 유틸
└── public/
    ├── apply/             # 가입 페이지
    └── uploads/           # 업로드된 파일
```
