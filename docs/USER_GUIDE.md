# Quick Start Guide

Get up and running with the NestJS Generator CLI in minutes!

## 🚀 Installation

```bash
npm install -g nestjs-generator
```

## 🎯 Generate Your First Project

### Interactive Mode (Recommended)

```bash
nxg init
```

This will guide you through:
- Project name and configuration
- Security features selection
- Authentication providers
- Optional services
- Compliance needs

### Non-Interactive Mode

```bash
nxg init --name my-awesome-api --api-base /api --api-version v1
```

## 📝 Add CRUD Operations

### Interactive DSL Editor

```bash
nxg add crud
```

This opens an editor where you can define entities using our DSL:

```bash
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
authorId:uuid@relation(User,many-to-one)
publishedAt:datetime?
```

### With Entity Name

```bash
nxg add crud --entity User
```

### With Specification File

```bash
nxg add crud --spec entities.json
```

## 🔐 Enable Authentication

```bash
nxg add auth
```

Select from available providers:
- JWT (Email + Password)
- Google OAuth2
- Microsoft OAuth2
- GitHub OAuth2
- API Keys
- OpenID Connect

## 🔧 Add Optional Services

```bash
nxg add service
```

Available services:
- **Email**: Nodemailer integration
- **Cache**: Redis support
- **Storage**: AWS S3 integration
- **Notifications**: Firebase push notifications
- **Payments**: Stripe integration
- **Search**: Elasticsearch integration

## 🏥 Validate Your Setup

```bash
nxg doctor
```

This checks:
- Node.js version
- NestJS project structure
- Dependencies
- Environment configuration
- Database connectivity

## 🚀 Start Your Application

```bash
cd your-project-name
npm install
npm run start:dev
```

Your application will be available at:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

## 🐳 Docker Support

```bash
# Start with Docker Compose
docker compose up -d

# View logs
docker compose logs -f app

# Stop services
docker compose down
```

## 🧪 Testing

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

## 📚 Next Steps

1. **Review Generated Code**: Explore the generated project structure
2. **Configure Environment**: Update `.env` with your settings
3. **Add More Entities**: Use `nxg add crud` for additional CRUD operations
4. **Customize Authentication**: Configure OAuth providers in `.env`
5. **Deploy**: Use the included Docker setup for deployment

## 🆘 Need Help?

- **[Project Specification](./PROJECT_SPECIFICATION.md)** - Original requirements and implementation status
- **[Technical Architecture](./TECHNICAL_ARCHITECTURE.md)** - Technical architecture and design decisions
- **[Testing Status](./TESTING_STATUS.md)** - Test suite status and coverage

---

**Happy coding! 🚀**
