.PHONY: dev
dev:
	bun dev

.PHONY: migrate
migrate:
	bun run db:migrate