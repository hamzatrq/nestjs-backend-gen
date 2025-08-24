# {{projectNamePascal}}

A production-ready NestJS application generated with NestJS Generator CLI.

## Features

- **NestJS Framework**: Modern, scalable Node.js framework
- **Prisma ORM**: Type-safe database access with PostgreSQL
- **Authentication**: Multi-provider authentication system
- **Security**: Helmet, CORS, CSRF, rate limiting
- **API Documentation**: Swagger/OpenAPI v3
- **Testing**: Jest with coverage thresholds
- **Docker Support**: Multi-stage Dockerfile and docker-compose
- **Logging**: Winston with multiple transports
- **Health Checks**: Built-in health and readiness endpoints

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd {{projectNameKebab}}
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the application**
   ```bash
   npm run start:dev
   ```

## API Documentation

Once the application is running, you can access:

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

## Available Scripts

- `npm run start:dev` - Start in development mode with hot reload
- `npm run build` - Build the application
- `npm run start:prod` - Start in production mode
- `npm run test` - Run tests
- `npm run test:cov` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── app/                 # Application bootstrap
├── config/             # Configuration modules
├── core/               # Core modules (auth, prisma, etc.)
├── common/             # Shared utilities and decorators
├── modules/            # Feature modules
└── docs/               # Documentation
```

## Environment Variables

See `.env.example` for all available environment variables.

## Docker

```bash
# Build and run with Docker Compose
docker compose up -d

# View logs
docker compose logs -f app
```

## Testing

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT
