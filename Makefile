COMPOSE ?= docker compose
SERVICE ?= wedding

.PHONY: dev
dev:
	bun dev

.PHONY: migrate
migrate:
	bun run db:migrate 

.PHONY: docker-build
docker-build:
	$(COMPOSE) build $(SERVICE)

.PHONY: docker-up
docker-up:
	$(COMPOSE) up -d --build $(SERVICE)

.PHONY: docker-down
docker-down:
	$(COMPOSE) down

.PHONY: docker-restart
docker-restart:
	$(COMPOSE) restart $(SERVICE)

.PHONY: docker-logs
docker-logs:
	$(COMPOSE) logs -f $(SERVICE)

.PHONY: docker-ps
docker-ps:
	$(COMPOSE) ps
