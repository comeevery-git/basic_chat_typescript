# Makefile for managing Docker Compose services

COMPOSE_FILE = docker-compose.yml
ENV_FILE = .env.local

.PHONY: init up down logs build clean help

# 의존성 설치
init: server client

server:
	@echo "Installing server dependencies..."
	cd chat && npm install

client:
	@echo "Installing client dependencies..."
	cd chat/client/svelte-chat && npm install

up:
	@echo "서버 및 클라이언트 서비스 시작 중..."
	docker-compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) up --build

down:
	@echo "모든 서비스 중지 중..."
	docker-compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) down

logs:
	@echo "모든 서비스의 로그 보기..."
	docker-compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) logs -f

build:
	@echo "서버 및 클라이언트 Docker 이미지 빌드 중..."
	docker-compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) build

clean:
	@echo "모든 컨테이너, 네트워크, 볼륨 제거 중..."
	docker-compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) down --volumes --remove-orphans

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  init          서버 및 클라이언트 의존성 설치"
	@echo "  up            서버 및 클라이언트 서비스 시작"
	@echo "  down          모든 서비스 중지"
	@echo "  build         서버 및 클라이언트 Docker 이미지 빌드"
	@echo "  logs          모든 서비스의 로그 보기"
	@echo "  clean         모든 컨테이너, 네트워크, 볼륨 제거"
	@echo "  help          도움말 메시지 표시"