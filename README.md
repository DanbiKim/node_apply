# Node.js 웹 서버

간단한 Node.js 기반 웹 서버 애플리케이션입니다.

## 기능

- 이름과 생년월일을 입력받는 폼 페이지
- 정보를 저장하는 REST API (`POST /api/info`)
- 정적 파일 서빙

## 시작하기

### 설치

```bash
npm install
```

### 실행

```bash
npm start
```

서버가 `http://localhost:3000`에서 실행됩니다.

## API 엔드포인트

- `GET /` - 정보 입력 폼 페이지
- `POST /api/info` - 정보 저장 API
  - Body: `{ "name": "이름", "birthDate": "YYYY-MM-DD" }`
- `GET /health` - 서버 상태 확인

## 프로젝트 구조

```
.
├── server.js          # 메인 서버 파일
├── package.json       # 프로젝트 설정
├── public/
│   └── index.html     # 폼 페이지
└── nginx.conf.example # nginx 설정 예시
```

## 요구사항

- Node.js >= 18

