.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

.PHONY: dev
dev: ## Run the dev server
	bun dev

.PHONY: build
build: ## Production build
	bun run build

.PHONY: start
start: ## Run the production build locally
	bun run start

.PHONY: lint
lint: ## Lint the codebase
	bun run lint

.PHONY: db-generate
db-generate: ## Generate Drizzle migrations from schema.ts
	bun run db:generate

.PHONY: migrate
migrate: db-generate ## Apply migrations to the DB in .env (local/preview)
	bun run db:migrate

.PHONY: migrate-prod
migrate-prod: ## Apply migrations to the prod Neon branch (.env.prod)
	set -a; . ./.env.prod; set +a; bun run db:migrate

.PHONY: r2-cors
r2-cors: ## Apply R2 CORS policy to dev + prod buckets
	npx wrangler r2 bucket cors set wedding-dev --file cloudflare/r2-cors.json --force
	npx wrangler r2 bucket cors set wedding-prod --file cloudflare/r2-cors.json --force
