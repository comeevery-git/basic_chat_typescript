# basic_chat_typescript

## Overview
채팅 애플리케이션

#### 기술 스택
- fastify, typescript
- mongodb
- svelte, rollup
- docker-compose

#### 로깅
- winston, kleur

#### HTTP 클라이언트
- axios


---


## Directory Structure


```
/chat
  /src
    /application
      /model
        - memberInformation.ts
        - sendMessage.ts
        - receiveMessage.ts  
      /service
        - chatApplicationService.ts
        - memberApplicationService.ts
        - authApplicationService.ts
    /domain
      - service
        - chatService.ts
      - model
        - chatMessage.ts
        - chatParticipant.ts
        - chatRoom.ts
      - repository
        - IChatMessageRepository.ts
        - IChatRoomRepository.ts
        - IChatParticipantRepository.ts
        - IMemberRepository.ts
    /infrastructure
      /gateway
        /response
          - memberApiResponse.ts
        - dynamoDBClient.ts
        - mongoDBClient.ts
        - authAPIClient.ts
        - appAPIClient.ts
      /persistence
        - chatMessageRepository.ts
        - chatParticipantRepository.ts
        - chatRoomRepository.ts
    /interface
      - router.ts          # 라우팅 설정
    /common
      - config.ts          # 환경 변수 설정
      - httpClient.ts      # 공통 HTTP 클라이언트
      - jwtTokenProvider.ts
      - logger.ts          # 로깅 설정
    plugin.ts              # 의존성 관리 플러그인
    server.ts              # 서버 설정
    Dockerfile
  - docker-compose.yml
  - package.json
  - tsconfig.json
```


---


## Commands

### Run

#### Makefile (docker-compose)

- 서버 및 클라이언트 의존성 설치: `make init`
- 서버 및 클라이언트 실행: `make run`
- 서버 실행: `make up`
- 서버 중지: `make down`
- 클라이언트 실행: `cd chat/client/svelte-chat && npm run dev`
