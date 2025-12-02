const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const submissions = [];

const sendJSON = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
};

const parseBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString();
  if (!raw) return {};

  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('application/json')) {
    return JSON.parse(raw);
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(raw);
    return Object.fromEntries(params.entries());
  }

  return {};
};

const FORM_PATH = path.join(__dirname, 'public', 'index.html');

const serveForm = (res) => {
  fs.readFile(FORM_PATH, (err, content) => {
    if (err) {
      console.error('Failed to read form file', err);
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('폼 파일을 불러올 수 없습니다.');
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(content);
  });
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    sendJSON(res, 200, { status: 'ok' });
    return;
  }

  if (req.method === 'GET' && req.url === '/') {
    serveForm(res);
    return;
  }

  if (req.method === 'POST' && req.url === '/api/info') {
    try {
      const { name, birthDate } = await parseBody(req);
      if (!name || !birthDate) {
        sendJSON(res, 400, { message: '이름과 생년월일을 모두 입력해주세요.' });
        return;
      }

      submissions.push({ name, birthDate, receivedAt: new Date().toISOString() });
      sendJSON(res, 200, { message: `${name}님의 정보가 임시로 저장되었습니다.`, data: { name, birthDate } });
    } catch (error) {
      console.error('Failed to parse request', error);
      sendJSON(res, 500, { message: '요청 처리 중 오류가 발생했습니다.' });
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('요청하신 페이지를 찾을 수 없습니다.');
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

