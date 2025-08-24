# NestJS Generator CLI

A powerful CLI tool for generating production-ready NestJS applications with best practices, security, and scalability built-in.

## 🚀 Features

- **Production-Ready Setup**: Generate complete NestJS applications with all essential configurations
- **Multi-Provider Authentication**: Support for JWT, OAuth2 (Google, Microsoft, GitHub), API keys, and OpenID Connect
- **ABAC Authorization**: Attribute-Based Access Control with policy engine
- **Security First**: Helmet, CORS, CSRF, rate limiting, and optional security features
- **Database Integration**: Prisma ORM with PostgreSQL, migrations, and seeding
- **API Documentation**: Swagger/OpenAPI v3 with TSDoc comments
- **Testing Pyramid**: Unit, integration, and e2e tests with coverage thresholds
- **Docker Support**: Multi-stage Dockerfile and docker-compose setup
- **CI/CD Ready**: Optional GitHub Actions workflow
- **Monitoring**: Health checks, logging with Winston, and optional Sentry integration
- **CRUD Generation**: Dynamic CRUD operations from simple entity definitions
- **Optional Services**: Email, file storage, caching, notifications, task scheduling, payments, and search

## 📦 Installation

```bash
npm install -g nestjs-generator
```

## 🎯 Quick Start

### Generate a new project

```bash
# Interactive mode
nxg init

# Non-interactive mode
nxg init --name my-app --api-base /api --api-version v1
```

### Add CRUD operations

```bash
# Interactive mode
nxg add crud

# With entity name
nxg add crud --entity User

# With specification file
nxg add crud --spec entities.json
```

### Enable authentication providers

```bash
# Interactive mode
nxg add auth

# Specific providers
nxg add auth --provider google,microsoft,github
```

### Add optional services

```bash
# Interactive mode
nxg add service

# Specific services
nxg add service --service email,cache,storage
```

### Validate project setup

```bash
nxg doctor
```

## 📋 Commands

### `nxg init`

Generate a new NestJS project with all configurations.

**Options:**
- `--name, -n`: Project name
- `--api-base, -a`: API base path (default: `/api`)
- `--api-version, -v`: API version (default: `v1`)
- `--skip-install`: Skip npm install
- `--skip-git`: Skip git initialization

**Examples:**
```bash
nxg init
nxg init --name my-app --api-base /api/v1
nxg init --name my-app --skip-install
```

### `nxg add crud`

Generate CRUD operations for entities using DSL.

**Options:**
- `--entity, -e`: Entity name
- `--spec, -s`: Path to entity specification file
- `--skip-tests`: Skip test generation

**Examples:**
```bash
nxg add crud
nxg add crud --entity User
nxg add crud --spec entities.json
```

### `nxg add auth`

Enable authentication providers.

**Options:**
- `--provider, -p`: Authentication provider(s) to enable (comma-separated)

**Examples:**
```bash
nxg add auth
nxg add auth --provider google,microsoft,github
```

### `nxg add service`

Scaffold optional services.

**Options:**
- `--service, -s`: Service(s) to scaffold (comma-separated)

**Examples:**
```bash
nxg add service
nxg add service --service email,cache,storage
```

### `nxg doctor`

Validate project setup and environment.

**Examples:**
```bash
nxg doctor
```

## 🏗️ Generated Project Structure

```
project-root/
├─ src/
│  ├─ app/
│  │  ├─ app.module.ts
│  │  ├─ app.controller.ts
│  │  ├─ app.service.ts
│  │  ├─ main.ts
│  │  ├─ bootstrap/
│  │  │  ├─ versioning.ts
│  │  │  ├─ security.ts
│  │  │  ├─ swagger.ts
│  │  │  └─ logger.ts
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
│  │  │  ├─ strategies/
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
│  │  └─ users/
│  │     ├─ users.module.ts
│  │     ├─ users.controller.ts
│  │     ├─ users.service.ts
│  │     ├─ users.repository.ts
│  │     ├─ dtos/
│  │     ├─ entities/
│  │     └─ policies/
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

## 📝 Entity DSL

Define entities using a simple DSL syntax:

```
EntityName
fieldName:fieldType[?][@unique][@id][@default(value)][@relation(TargetEntity,relationshipType)]
```

**Supported field types:**
- `string`, `text`, `int`, `bigint`, `float`, `decimal`
- `boolean`, `date`, `datetime`, `json`, `uuid`

**Modifiers:**
- `?`: Optional field
- `@unique`: Unique constraint
- `@id`: Primary key
- `@default(value)`: Default value
- `@relation(TargetEntity,type)`: Relationship

**Examples:**

```bash
# Simple User entity
User
id:uuid@id@default(cuid())
email:string@unique
name:string?
createdAt:datetime@default(now())
updatedAt:datetime@default(now())

# Post entity with relationship
Post
id:uuid@id@default(cuid())
title:string
content:text?
authorId:uuid@relation(User,many-to-one)
publishedAt:datetime?
```

## 🔧 Configuration

### Environment Variables

The generated project includes a comprehensive `.env.example` file with all necessary variables:

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=/api
API_VERSION=v1

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app?schema=public

# Authentication
JWT_SECRET=change_me
JWT_EXPIRES_IN=15m
REFRESH_JWT_SECRET=change_me_too
REFRESH_JWT_EXPIRES_IN=30d

# Security
CORS_ORIGINS=http://localhost:3000
RATE_LIMIT_POINTS=120
RATE_LIMIT_DURATION=60
CSRF_SECRET=change_me

# Logging
LOG_LEVEL=info
LOG_DESTINATION=console
LOG_FILE_PATH=logs/app.log

# Monitoring
SENTRY_DSN=
SENTRY_ENV=development

# Optional Services
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

## 🚀 Getting Started

1. **Generate a new project:**
   ```bash
   nxg init
   ```

2. **Navigate to the project:**
   ```bash
   cd your-project-name
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the application:**
   ```bash
   npm run start:dev
   ```

5. **Access your application:**
   - API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/docs
   - Health Check: http://localhost:3000/health

## 🧪 Testing

The generated project includes a complete testing setup:

```bash
# Run all tests
npm run test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests with coverage
npm run test:cov
```

## 🐳 Docker

The generated project includes Docker support:

```bash
# Start with Docker Compose
docker compose up -d

# View logs
docker compose logs -f app

# Stop services
docker compose down
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **CSRF**: Cross-site request forgery protection
- **Rate Limiting**: Request rate limiting
- **Input Validation**: Global validation pipe
- **ABAC**: Attribute-based access control
- **JWT**: Secure token-based authentication
- **Optional**: Input sanitization, data encryption

## 📚 Documentation

- **API Documentation**: Auto-generated Swagger/OpenAPI v3 docs
- **Code Documentation**: TSDoc comments throughout the codebase
- **Architecture Guide**: Comprehensive documentation in `docs/architecture.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/nestjs-generator/issues)
- **Documentation**: [GitHub Wiki](https://github.com/your-org/nestjs-generator/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/nestjs-generator/discussions)

---

**Happy coding! 🚀**
