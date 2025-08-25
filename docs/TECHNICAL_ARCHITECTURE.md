# Architecture Guide

This document provides a comprehensive overview of the NestJS Generator CLI architecture, including the CLI framework, template system, and generated project structure.

## 🏗️ CLI Architecture

### Core Framework

The CLI is built using **@oclif/core**, a robust CLI framework that provides:

- **Command Structure**: Each command is a separate class extending `Command`
- **Flag Handling**: Type-safe flag definitions with validation
- **Help System**: Auto-generated help documentation
- **Plugin Support**: Extensible architecture for additional commands

### Project Structure

```
src/
├── commands/           # CLI commands
│   ├── init.ts        # Project initialization
│   ├── add-crud.ts    # CRUD generation
│   ├── add-auth.ts    # Authentication setup
│   ├── add-service.ts # Service scaffolding
│   └── doctor.ts      # Project validation
├── lib/               # Core libraries
│   ├── writer/        # File writing utilities
│   ├── dsl/           # DSL parser
│   ├── prisma/        # Prisma model generation
│   ├── auth/          # Authentication configuration
│   ├── service/       # Service generation
│   └── prompts/       # Interactive prompts
└── templates/         # Handlebars templates
    ├── app/           # Application templates
    ├── modules/       # Module templates
    ├── config/        # Configuration templates
    └── docker/        # Docker templates
```

## 🔧 Template System

### Handlebars Integration

The template system uses **Handlebars** for dynamic content generation:

- **Custom Helpers**: Case conversion, string manipulation, mathematical operations
- **Conditional Rendering**: Feature flags and optional components
- **Nested Templates**: Modular template organization
- **Context Objects**: Type-safe template data

### Template Categories

1. **Application Templates**
   - Main application files (`main.ts`, `app.module.ts`)
   - Bootstrap modules (versioning, security, swagger)
   - Health check endpoints

2. **Configuration Templates**
   - Environment configuration
   - Database configuration
   - Authentication configuration
   - Security configuration

3. **Module Templates**
   - CRUD modules with controllers, services, DTOs
   - Authentication modules with strategies and guards
   - Service modules (email, cache, storage, etc.)

4. **Infrastructure Templates**
   - Docker configuration
   - GitHub Actions workflows
   - Prisma schema
   - Test files

## 📝 DSL Parser

### Entity Definition Language

The DSL parser converts simple text definitions into structured data:

```bash
User
id:uuid@id@default(cuid())
email:string@unique
name:string?
createdAt:datetime@default(now())
updatedAt:datetime@default(now())
```

### Parser Features

- **Field Type Mapping**: Converts DSL types to Prisma/TypeScript types
- **Relationship Parsing**: Handles one-to-one, one-to-many, many-to-many
- **Validation**: Ensures required fields and proper syntax
- **Error Handling**: Detailed error messages for invalid DSL

## 🗄️ Database Integration

### Prisma ORM

Generated projects use **Prisma** for database operations:

- **Schema Generation**: Automatic Prisma schema creation
- **Migration Support**: Database migration handling
- **Type Safety**: Generated TypeScript types
- **Query Builder**: Type-safe database queries

### Supported Databases

- **PostgreSQL**: Primary database (recommended)
- **MySQL**: Alternative option
- **SQLite**: Development/testing option

## 🔐 Authentication System

### Multi-Provider Support

The authentication system supports multiple providers:

1. **JWT**: Email + password authentication
2. **Google OAuth2**: Google account integration
3. **Microsoft OAuth2**: Microsoft account integration
4. **GitHub OAuth2**: GitHub account integration
5. **API Keys**: API key authentication
6. **OpenID Connect**: Generic OIDC support

### Architecture Components

- **Strategies**: Passport.js strategies for each provider
- **Guards**: Route protection with role-based access
- **ABAC Engine**: Attribute-based access control
- **Token Management**: JWT token generation and validation

## 🏗️ Generated Project Architecture

### Module Structure

```
src/
├── app/               # Main application
│   ├── main.ts       # Application entry point
│   ├── app.module.ts # Root module
│   └── bootstrap/    # Application bootstrap
├── config/           # Configuration modules
│   ├── config.module.ts
│   ├── app.config.ts
│   ├── db.config.ts
│   └── auth.config.ts
├── core/             # Core modules
│   ├── prisma/       # Database integration
│   ├── auth/         # Authentication
│   ├── abac/         # Authorization
│   ├── security/     # Security features
│   └── logger/       # Logging
├── modules/          # Feature modules
│   ├── users/        # User management
│   ├── [entity]/     # Generated CRUD modules
│   └── [service]/    # Optional service modules
└── common/           # Shared utilities
    ├── decorators/
    ├── dtos/
    ├── exceptions/
    └── utils/
```

### Security Architecture

1. **Helmet**: Security headers
2. **CORS**: Cross-origin resource sharing
3. **Rate Limiting**: Request throttling
4. **CSRF Protection**: Cross-site request forgery prevention
5. **Input Validation**: Request validation with class-validator
6. **ABAC**: Attribute-based access control

### Monitoring & Health

1. **Health Checks**: Database and service health monitoring
2. **Logging**: Winston-based logging with multiple transports
3. **Error Tracking**: Sentry integration for error monitoring
4. **API Documentation**: Swagger/OpenAPI v3 documentation

## 🧪 Testing Architecture

### Test Pyramid

1. **Unit Tests**: Individual component testing
2. **Integration Tests**: Module integration testing
3. **E2E Tests**: Full application testing

### Test Infrastructure

- **Jest**: Test runner and assertion library
- **Supertest**: HTTP testing for API endpoints
- **Coverage**: Code coverage reporting
- **Mocking**: Comprehensive mock system

## 🐳 Containerization

### Docker Support

- **Multi-stage Builds**: Optimized production images
- **Non-root User**: Security best practices
- **Health Checks**: Container health monitoring
- **Environment Configuration**: Flexible environment setup

### Docker Compose

- **Development Environment**: Local development setup
- **Database**: PostgreSQL container
- **Redis**: Caching container (optional)
- **Networking**: Isolated network configuration

## 🔄 Development Workflow

### CLI Development

1. **Command Development**: Add new commands to `src/commands/`
2. **Template Updates**: Modify templates in `src/templates/`
3. **Testing**: Add tests for new functionality
4. **Documentation**: Update documentation

### Generated Project Development

1. **Entity Definition**: Use DSL to define entities
2. **CRUD Generation**: Generate CRUD operations
3. **Authentication Setup**: Configure authentication providers
4. **Service Integration**: Add optional services
5. **Customization**: Extend generated code

## 📊 Performance Considerations

### CLI Performance

- **Template Caching**: Cached template compilation
- **Parallel Processing**: Concurrent file operations
- **Memory Management**: Efficient memory usage
- **Error Recovery**: Graceful error handling

### Generated Project Performance

- **Database Optimization**: Efficient queries and indexing
- **Caching Strategy**: Redis-based caching
- **Connection Pooling**: Database connection management
- **Load Balancing**: Horizontal scaling support

## 🔮 Future Enhancements

### Planned Features

1. **GUI Interface**: Web-based interface for project generation
2. **Plugin System**: Extensible plugin architecture
3. **Template Marketplace**: Community-contributed templates
4. **Cloud Integration**: Direct deployment to cloud platforms
5. **Microservices Support**: Microservices architecture generation

### Architecture Evolution

1. **Modular CLI**: Plugin-based command system
2. **Template Engine**: Advanced templating with custom languages
3. **AI Integration**: AI-powered code generation
4. **Real-time Collaboration**: Multi-user project generation

---

This architecture provides a solid foundation for generating production-ready NestJS applications with comprehensive features and extensibility.
