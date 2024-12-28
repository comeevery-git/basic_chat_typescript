# 서버의 Dockerfile 예시
FROM node:20

WORKDIR /app

# package.json과 package-lock.json을 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 모든 소스 코드 복사
COPY . .

# 서버 포트 노출
EXPOSE 8091

# 서버 시작 명령어
CMD ["npm", "start"]