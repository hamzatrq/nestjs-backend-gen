# Project Specification — **CLI Generator for Production-Grade NestJS Monoliths**

## 1) Scope (Phase 1)

Build a **TypeScript CLI** that generates a **production-ready NestJS backend** (monolith) with:

* NestJS + Prisma + PostgreSQL by default
* Multi-provider authentication (configurable at generation time)
* ABAC authorization baked in
* API versioning, CORS, Helmet, CSRF, rate limiting enabled by default
* Optional security add-ons toggled via prompts and `.env`
* Full test pyramid preconfigured (unit, integration, e2e) with coverage
* Swagger API docs and TSDoc comments wired by default
* `.env` configuration via a central ConfigService
* Dockerfile and docker-compose for local dev
* Optional GitHub Actions template
* Optional Sentry integration
* Health and readiness endpoints mandatory
* CRUD code generation from a simple entity schema DSL

Phase 1 delivers **CLI only**. A GUI can follow later.

---

## 2) Tooling Stack (for the generator itself)

* **Language:** TypeScript
* **Runtime:** Node.js 18+
* **CLI framework:** `oclif`
* **Interactive prompts:** `inquirer`
* **Templating:** `handlebars`
* **File ops:** `fs-extra`
* **String case helpers:** `change-case`
* **Code formatting (post-write):** `prettier`
* **Unit tests (generator):** `jest`
* **Lint:** `eslint` with TypeScript plugin
* **Publish:** npm package with a bin entry

---

## 3) Generated Project Stack (fixed)

* **Framework:** NestJS
* **Language:** TypeScript
* **HTTP adapter:** Express (Nest default)
* **ORM:** Prisma
* **Database:** PostgreSQL
* **Validation:** `class-validator` + `class-transformer`
* **AuthN:** Passport strategies via Nest

  * Email+password (JWT)
  * Google OAuth2
  * Microsoft OAuth2
  * GitHub OAuth2
  * API keys
  * OpenID Connect (generic)
* **AuthZ:** ABAC guard + policy engine (local module)
* **Docs:** Swagger (OpenAPI v3) + TSDoc
* **Config:** `@nestjs/config` with strongly typed ConfigService
* **Security:** Helmet, CSRF, CORS, rate limiter
* **Logger:** Winston (console transport by default, file and JSON transports available)
* **Error tracking:** Sentry (toggle via `.env`)
* **Health:** `/health` and `/readiness` with database check
* **Testing:** Jest + Supertest (unit, integration, e2e) with coverage thresholds
* **Containers:** Dockerfile + docker-compose (app + postgres)
* **CI/CD:** GitHub Actions workflow (optional scaffold)

No substitutions.

---

## 4) CLI UX — Commands and Flow

### 4.1 Install

```bash
npm i -g <package-name>
```

### 4.2 Commands

* `nxg init` — generate a new project
* `nxg add crud` — generate CRUD for entities
* `nxg add auth` — enable selected auth providers after init
* `nxg add service` — scaffold optional services (mail, cache, storage, notifications, payments, search)
* `nxg doctor` — validate env, database connectivity, pending migrations

### 4.3 `nxg init` Prompt Flow (exact order)

1. **Project name** (kebab-case)
2. **API base path** (default `/api`)
3. **Default API version** (default `v1`)
4. **Enable optional security features** (multi-select)

   * Input sanitization
   * Data encryption at rest (application-level for selected fields)
   * Extra request validation schemas beyond DTOs (e.g., Joi for configs)
5. **Compliance needs** (multi-select)

   * GDPR
   * HIPAA
   * PCI-DSS
   * None
6. **Authentication providers** (multi-select)

   * Email+password (JWT)
   * Google
   * Microsoft
   * GitHub
   * API keys
   * OpenID Connect (generic)
7. **Enable Sentry** (yes/no)
8. **GitHub Actions workflow** (yes/no)
9. **Optional services** (multi-select; scaffold modules only)

   * Email (SMTP + provider abstraction)
   * File storage (local + S3 adapter)
   * Cache (Redis)
   * Notifications (web push)
   * Task scheduling (BullMQ + Redis)
   * Payments (Stripe)
   * Search (Meilisearch)

After prompts:

* Scaffold files
* Run `npm i`
* Initialize Prisma schema and create initial migration
* Format code with Prettier

### 4.4 `nxg add crud` Prompt Flow

* **Entity name** (PascalCase)
* **Fields** via DSL (see §8)
* **Relationships** via DSL
* **Soft delete** (yes/no)
* **Auditing** (createdBy, updatedBy, timestamps) (yes/no)
* **ABAC policies**: define attribute rules for actions (create, read, update, delete)
* **Generate tests** (always yes, no prompt)

Outputs:

* Prisma model + migration
* Module folder with controller, service, repository, DTOs, entities, policies
* Swagger decorators on routes and DTOs
* Unit, integration, e2e test files
* Seed and factory updates

---

## 5) Generated Project — Folder Layout

```
project-root/
├─ src/
│  ├─ app/
│  │  ├─ app.module.ts
│  │  ├─ app.controller.ts            # ping, health redirect
│  │  ├─ app.service.ts
│  │  ├─ main.ts
│  │  ├─ bootstrap/
│  │  │  ├─ versioning.ts             # URI versioning
│  │  │  ├─ security.ts               # helmet, cors, csrf, rate-limit
│  │  │  ├─ swagger.ts                # OpenAPI setup
│  │  │  └─ logger.ts                 # winston setup
│  │  └─ health/
│  │     ├─ health.module.ts
│  │     ├─ health.controller.ts
│  │     └─ health.service.ts
│  │
│  ├─ config/
│  │  ├─ config.module.ts
│  │  ├─ app.config.ts
│  │  ├─ db.config.ts
│  │  ├─ auth.config.ts
│  │  ├─ security.config.ts
│  │  ├─ logging.config.ts
│  │  └─ sentry.config.ts
│  │
│  ├─ core/
│  │  ├─ prisma/
│  │  │  ├─ prisma.module.ts
│  │  │  ├─ prisma.service.ts
│  │  │  └─ prisma-exception.filter.ts
│  │  ├─ auth/
│  │  │  ├─ auth.module.ts
│  │  │  ├─ auth.controller.ts
│  │  │  ├─ auth.service.ts
│  │  │  ├─ strategies/               # jwt, local, google, microsoft, github, oidc, api-key
│  │  │  └─ guards/
│  │  ├─ abac/
│  │  │  ├─ abac.module.ts
│  │  │  ├─ abac.guard.ts
│  │  │  └─ policy.engine.ts
│  │  ├─ security/
│  │  │  ├─ security.module.ts
│  │  │  └─ security.service.ts
│  │  └─ logger/
│  │     ├─ logger.module.ts
│  │     └─ logger.service.ts
│  │
│  ├─ common/
│  │  ├─ decorators/
│  │  ├─ dtos/
│  │  ├─ exceptions/
│  │  ├─ filters/
│  │  ├─ guards/
│  │  ├─ interceptors/
│  │  ├─ middleware/
│  │  └─ utils/
│  │
│  ├─ modules/
│  │  └─ users/                        # example created by init
│  │     ├─ users.module.ts
│  │     ├─ users.controller.ts
│  │     ├─ users.service.ts
│  │     ├─ users.repository.ts
│  │     ├─ dtos/
│  │     │  ├─ create-user.dto.ts
│  │     │  └─ update-user.dto.ts
│  │     ├─ entities/
│  │     │  └─ user.entity.ts
│  │     └─ policies/
│  │        └─ users.policy.ts
│  │
│  └─ docs/
│     ├─ swagger.ts
│     └─ tsdoc.md
│
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
│
├─ test/
│  ├─ unit/
│  ├─ integration/
│  ├─ e2e/
│  └─ factories/
│
├─ .env.example
├─ Dockerfile
├─ docker-compose.yml
├─ jest.config.ts
├─ tsconfig.json
├─ .eslintrc.js
├─ .prettierrc
├─ package.json
└─ README.md
```

---

## 6) Environment Variables (baseline)

`.env.example` must include:

```
NODE_ENV=development
PORT=3000
API_PREFIX=/api
API_VERSION=v1

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app?schema=public

JWT_SECRET=change_me
JWT_EXPIRES_IN=15m
REFRESH_JWT_SECRET=change_me_too
REFRESH_JWT_EXPIRES_IN=30d

CORS_ORIGINS=http://localhost:3000

RATE_LIMIT_POINTS=120
RATE_LIMIT_DURATION=60

CSRF_SECRET=change_me

LOG_LEVEL=info
LOG_DESTINATION=console            # console | file | json
LOG_FILE_PATH=logs/app.log

SENTRY_DSN=
SENTRY_ENV=development

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

REDIS_URL=redis://localhost:6379
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
```

---

## 7) ABAC Model (mandatory)

* **Policy engine** evaluates `{ subject, action, resource, context }`.
* **Subject**: authenticated principal (id, roles, orgId, attributes).
* **Actions**: `create`, `read`, `update`, `delete`, `list`.
* **Resource**: domain entity with attributes.
* **Context**: request metadata (tenant, ownership, flags).
* **Rule format (TypeScript)**: declarative array of predicates evaluated in order; first match decides.
* **Per-module policy file** with exported rules and a helper to attach to route handlers via a decorator, enforced by `AbacGuard`.

---

## 8) CRUD Entity DSL (input to `nxg add crud`)

Define entities using a concise syntax in the prompt or via a `—spec` JSON file.

**Field syntax:**

```
<name>:<type>[?][@unique][@id][@default(<value>)][@relation(<Entity>,<kind>)]
```

**Supported types:** `string`, `text`, `int`, `bigint`, `float`, `decimal`, `boolean`, `date`, `datetime`, `json`, `uuid`

**Examples:**

```
User
id:uuid@id@default(cuid())
email:string@unique
name:string?
createdAt:datetime@default(now())
updatedAt:datetime@default(now())

Post
id:uuid@id@default(cuid())
title:string
content:text?
authorId:uuid@relation(User, many-to-one)
```

The generator must:

* Write the Prisma model
* Create migration
* Create DTOs with validation decorators
* Create controller, service, repository
* Wire Swagger decorators
* Create ABAC policies with ownership checks when `@relation` implies ownership
* Create unit, integration, e2e tests
* Update seed and factories

---

## 9) Security Defaults

* **Helmet** on
* **CORS** origins from `CORS_ORIGINS`
* **CSRF** on with double-submit cookie pattern
* **Rate limiting** via in-memory store by default; Redis store enabled when `REDIS_URL` is set
* **Input validation** via global `ValidationPipe` (whitelist, forbidUnknownValues)
* **Optional sanitization** enabled when selected during init
* **Optional field-level encryption** utility available and wired when selected

---

## 10) Logging and Monitoring

* **Winston** logger injected via `LoggerService`
* Log format: timestamp + level + context + message
* Transport selected by `LOG_DESTINATION`
* **Sentry** integration behind feature flag via `SENTRY_DSN`
* **Health** endpoints:

  * `GET /health` basic liveness
  * `GET /readiness` prisma connectivity check

---

## 11) Testing Requirements (generated project)

* **Jest** config with projects: unit, integration, e2e
* **Coverage thresholds:** lines 80% functions 80% branches 70% statements 80%
* **Unit tests:** services, guards, policies
* **Integration tests:** repositories with a test database (docker-compose service)
* **E2E tests:** Supertest against a running app instance, seeded data
* **Factories:** per-entity test data builders

Commands:

```
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:cov
```

---

## 12) Docker Requirements

* **Dockerfile** multi-stage build:

  * builder stage installs deps and compiles TypeScript
  * runner stage copies `dist` and production deps
* **docker-compose.yml** with services:

  * `app` (binds `.env`) depends on `db`
  * `db` postgres with persistent volume
  * `redis` when cache selected

Commands:

```
docker compose up -d
docker compose logs -f app
```

---

## 13) GitHub Actions (optional scaffold)

Workflow file: `.github/workflows/ci.yml`

* Triggers: push, pull\_request
* Steps: checkout, setup Node 18, cache npm, install, lint, build, test, upload coverage artifact

---

## 14) Generator Implementation Tasks (step-by-step)

1. **Bootstrap generator repo**

   * Init TypeScript config
   * Add `oclif`, `inquirer`, `handlebars`, `fs-extra`, `change-case`, `prettier`, `jest`, `eslint`
   * Create bin entry `nxg` in `package.json`
2. **Template engine**

   * Implement a utility to copy template trees and render `handlebars` placeholders
   * Add a finalizer to run Prettier on written files
3. **`init` command**

   * Implement prompts per §4.3
   * Copy base project template
   * Replace placeholders (`{{projectName}}`, `{{apiBase}}`, `{{apiVersion}}`, flags)
   * Run `npm i` in the target
   * Execute `prisma generate` and an initial migration
4. **Base project template**

   * Include complete folder layout per §5
   * Include all configs, providers, bootstrap logic
   * Include working `users` module with minimal fields and a working auth guard wired to prove the path
   * Include Swagger wired at `/docs`
5. **Security module**

   * Implement global pipes, Helmet, CORS, CSRF, rate limiter
   * Read `.env` for all knobs
6. **Auth module**

   * Implement email+password with JWT access and refresh tokens
   * Implement Google, Microsoft, GitHub, API key, generic OIDC strategies behind feature flags
   * Expose login, refresh, logout endpoints
7. **ABAC**

   * Implement `AbacGuard`
   * Implement `PolicyEngine` with rule registration per module
   * Provide decorators `@Action('read')` etc.
8. **CRUD generator**

   * Implement `nxg add crud`
   * Parse DSL into Prisma model
   * Update `schema.prisma`, run migration
   * Generate module files with DTOs, repository, service, controller, policies, tests, factories
   * Regenerate Swagger types when necessary
9. **Optional services**

   * Implement `nxg add service` to scaffold mail, cache, storage, notifications, tasks, payments, search
   * Each service shipped as a Nest module with config, interface, and example usage
10. **Doctor**

    * Implement `nxg doctor` to check Node version, env presence, database connection, pending migrations
11. **Testing (generator)**

    * Unit tests for DSL parser, file writer, path resolver, policy scaffolder
12. **Docs**

    * Write `README.md` for the CLI
    * Generate `README.md` template for created projects
    * Provide `docs/architecture.md` template in generated projects
13. **Publish**

    * Configure npm publish workflow and semantic version tagging

---

## 15) Acceptance Criteria

* `nxg init` produces a project that:

  * Starts with `npm run start:dev`
  * Serves Swagger at `/docs`
  * Exposes `/health` and `/readiness`
  * Connects to Postgres from `.env`
  * Logs via Winston at configured level
  * Enforces global validation, Helmet, CSRF, CORS, rate limiting
  * Runs all tests with coverage thresholds met
  * Builds a Docker image and runs via docker-compose with Postgres

* `nxg add crud` for an example entity:

  * Updates Prisma schema and applies migration
  * Creates controller, service, repository, DTOs, entity mapper
  * Adds ABAC policies and a guard-protected route
  * Generates passing unit, integration, e2e tests
  * Updates seed and factories

* `nxg add auth`:

  * Enables selected providers
  * Creates provider configs and strategies
  * Exposes sign-in endpoints and refresh flow

* `nxg add service`:

  * Adds chosen module
  * Creates config entries stubbing env keys
  * Provides example usage with one route guarded by ABAC

* Optional GitHub Actions workflow, when requested at init, runs lint, build, tests and reports success.

---

## 16) Base Template — Key Files (abbreviated examples)

**`src/app/main.ts`**

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupVersioning } from './bootstrap/versioning';
import { setupSecurity } from './bootstrap/security';
import { setupSwagger } from './bootstrap/swagger';
import { setupLogger } from './bootstrap/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  setupLogger(app);
  setupVersioning(app);
  await setupSecurity(app);
  setupSwagger(app);
  const port = process.env.PORT ?? '3000';
  await app.listen(port);
}
bootstrap();
```

**`src/core/abac/abac.guard.ts`**

```ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PolicyEngine } from './policy.engine';
@Injectable()
export class AbacGuard implements CanActivate {
  constructor(private readonly engine: PolicyEngine) {}
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    return this.engine.evaluate(req.user, req.abac?.action, req.abac?.resource, req);
  }
}
```

(Full templates will be included in the `templates/` directory of the generator.)

---

## 17) Repository Structure (generator)

```
generator/
├─ src/
│  ├─ commands/
│  │  ├─ init.ts
│  │  ├─ add-crud.ts
│  │  ├─ add-auth.ts
│  │  ├─ add-service.ts
│  │  └─ doctor.ts
│  ├─ lib/
│  │  ├─ prompts/
│  │  ├─ dsl/
│  │  │  └─ parser.ts
│  │  ├─ writer/
│  │  │  ├─ copier.ts
│  │  │  └─ render.ts
│  │  ├─ prisma/
│  │  │  └─ model-writer.ts
│  │  ├─ abac/
│  │  │  └─ policy-writer.ts
│  │  └─ util/
│  ├─ templates/
│  │  ├─ project/
│  │  ├─ crud/
│  │  └─ services/
│  └─ index.ts
├─ jest.config.ts
├─ tsconfig.json
├─ .eslintrc.js
├─ .prettierrc
├─ package.json
└─ README.md
```

---

### Final Note

When every acceptance criterion in §15 passes, the generator is **complete** for Phase 1.
