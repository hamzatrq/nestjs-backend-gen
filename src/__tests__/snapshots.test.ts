import { TemplateRenderer } from '../lib/writer/render';
import { DslParser } from '../lib/dsl/parser';
import { PrismaModelWriter } from '../lib/prisma/model-writer';

describe('Snapshot Tests', () => {
  let renderer: TemplateRenderer;

  beforeEach(() => {
    renderer = new TemplateRenderer();
  });

  describe('Template Rendering Snapshots', () => {
    it('should generate consistent package.json template', () => {
      const context = {
        projectName: 'test-project',
        description: 'Test project',
        author: 'Test Author',
        version: '1.0.0',
        database: 'postgresql',
        hasJwtAuth: true,
        hasGoogleAuth: true,
        hasEmailService: true,
        hasFileStorageService: true,
        hasCacheService: false,
        hasNotificationService: false,
        hasTaskSchedulingService: false,
        hasPaymentService: false,
        hasSearchService: false,
        hasDocker: true,
        hasGitHubActions: true,
        hasSentry: true
      };

      const template = `{
  "name": "{{projectName}}",
  "description": "{{description}}",
  "author": "{{author}}",
  "version": "{{version}}",
  "main": "dist/main.js",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/terminus": "^10.0.0",
    "@prisma/client": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "helmet": "^7.0.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "passport-google-oauth20": "^2.0.0",
    "passport-github2": "^0.1.12",
    "passport-microsoft": "^0.1.0",
    "passport-openidconnect": "^0.1.2",
    "prisma": "^5.0.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "winston": "^3.10.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/bcryptjs": "^2.4.2",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.2",
    "@types/node": "^20.3.1",
    "@types/passport-jwt": "^3.0.8",
    "@types/passport-google-oauth20": "^2.0.11",
    "@types/passport-github2": "^0.1.4",
    "@types/passport-microsoft": "^0.1.1",
    "@types/passport-openidconnect": "^0.1.1",
    "@types/supertest": "^2.0.12",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.42.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "jest": "^29.5.0",
    "prettier": "^3.0.0",
    "source-map-support": "^0.5.21",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.1",
    "typescript": "^5.1.3"
  },
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}`;

      const result = renderer.renderTemplate(template, context);
      expect(result).toMatchSnapshot();
    });

    it('should generate consistent Prisma schema template', () => {
      const context = {
        database: 'postgresql',
        hasJwtAuth: true,
        hasGoogleAuth: true,
        hasEmailService: true,
        hasFileStorageService: true
      };

      const template = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "{{database}}"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String?
  name      String?
  avatar    String?
  provider  String   @default("local")
  providerId String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  // Relations
  posts Post[]

  @@map("users")
}

model Post {
  id          String    @id @default(cuid())
  title       String
  content     String?
  published   Boolean   @default(false)
  publishedAt DateTime?
  authorId    String
  author      User      @relation(fields: [authorId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  @@map("posts")
}

model EmailTemplate {
  id        String   @id @default(cuid())
  name      String   @unique
  subject   String
  body      String
  variables Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("email_templates")
}

model FileUpload {
  id          String   @id @default(cuid())
  filename    String
  originalName String
  mimeType    String
  size        Int
  path        String
  url         String?
  uploadedBy  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("file_uploads")
}`;

      const result = renderer.renderTemplate(template, context);
      expect(result).toMatchSnapshot();
    });

    it('should generate consistent Dockerfile template', () => {
      const context = {
        projectName: 'test-project',
        hasSentry: true
      };

      const template = `# Use the official Node.js runtime as the base image
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set the working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node dist/health-check.js

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]`;

      const result = renderer.renderTemplate(template, context);
      expect(result).toMatchSnapshot();
    });

    it('should generate consistent docker-compose template', () => {
      const context = {
        projectName: 'test-project',
        database: 'postgresql'
      };

      const template = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/{{projectName}}
      - JWT_SECRET=your-jwt-secret
      - JWT_EXPIRES_IN=1d
    depends_on:
      - postgres
    volumes:
      - .:/app
      - /app/node_modules
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB={{projectName}}
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge`;

      const result = renderer.renderTemplate(template, context);
      expect(result).toMatchSnapshot();
    });
  });

  describe('DSL Parsing Snapshots', () => {
    it('should parse User entity DSL consistently', () => {
      const dsl = `User
id:uuid@id@default(cuid())
email:string@unique
name:string?
password:string
avatar:string?
provider:string@default(local)
providerId:string?
createdAt:datetime@default(now())
updatedAt:datetime@default(now())
deletedAt:datetime?`;

      const result = DslParser.parseEntityDsl(dsl);
      expect(result).toMatchSnapshot();
    });

    it('should parse Post entity with relationships consistently', () => {
      const dsl = `Post
id:uuid@id@default(cuid())
title:string
content:text?
published:boolean@default(false)
publishedAt:datetime?
authorId:uuid@relation(User,many-to-one)
createdAt:datetime@default(now())
updatedAt:datetime@default(now())
deletedAt:datetime?`;

      const result = DslParser.parseEntityDsl(dsl);
      expect(result).toMatchSnapshot();
    });

    it('should parse multiple entities consistently', () => {
      const dsl = `User
id:uuid@id@default(cuid())
email:string@unique
name:string?

Post
id:uuid@id@default(cuid())
title:string
content:text?
authorId:uuid@relation(User,many-to-one)

Comment
id:uuid@id@default(cuid())
content:text
postId:uuid@relation(Post,many-to-one)
authorId:uuid@relation(User,many-to-one)`;

      const result = DslParser.parseEntitiesDsl(dsl);
      expect(result).toMatchSnapshot();
    });
  });

  describe('Prisma Model Generation Snapshots', () => {
    it('should generate User model consistently', () => {
      const entity = {
        name: 'User',
        fields: [
          {
            name: 'id',
            type: 'uuid' as const,
            optional: false,
            unique: false,
            isId: true,
            defaultValue: 'cuid()'
          },
          {
            name: 'email',
            type: 'string' as const,
            optional: false,
            unique: true,
            isId: false
          },
          {
            name: 'name',
            type: 'string' as const,
            optional: true,
            unique: false,
            isId: false
          },
          {
            name: 'password',
            type: 'string' as const,
            optional: false,
            unique: false,
            isId: false
          },
          {
            name: 'createdAt',
            type: 'datetime' as const,
            optional: false,
            unique: false,
            isId: false,
            defaultValue: 'now()'
          },
          {
            name: 'updatedAt',
            type: 'datetime' as const,
            optional: false,
            unique: false,
            isId: false,
            defaultValue: 'now()'
          }
        ],
        relationships: [],
        softDelete: false,
        auditing: true,
        abacPolicies: []
      };

      const result = PrismaModelWriter.generateModel(entity);
      expect(result).toMatchSnapshot();
    });

    it('should generate Post model with relationships consistently', () => {
      const entity = {
        name: 'Post',
        fields: [
          {
            name: 'id',
            type: 'uuid' as const,
            optional: false,
            unique: false,
            isId: true,
            defaultValue: 'cuid()'
          },
          {
            name: 'title',
            type: 'string' as const,
            optional: false,
            unique: false,
            isId: false
          },
          {
            name: 'content',
            type: 'text' as const,
            optional: true,
            unique: false,
            isId: false
          },
          {
            name: 'published',
            type: 'boolean' as const,
            optional: false,
            unique: false,
            isId: false,
            defaultValue: 'false'
          },
          {
            name: 'authorId',
            type: 'uuid' as const,
            optional: false,
            unique: false,
            isId: false
          }
        ],
        relationships: [
          {
            name: 'author',
            targetEntity: 'User',
            type: 'many-to-one' as const,
            optional: false
          }
        ],
        softDelete: false,
        auditing: true,
        abacPolicies: []
      };

      const result = PrismaModelWriter.generateModel(entity);
      expect(result).toMatchSnapshot();
    });
  });

  describe('Generated File Content Snapshots', () => {
    it('should generate consistent controller template', () => {
      const context = {
        entityName: 'User',
        entityNamePlural: 'users',
        entityNameLower: 'user',
        entityNameLowerPlural: 'users',
        fields: [
          {
            name: 'id',
            type: 'uuid',
            optional: false,
            unique: false,
            isId: true
          },
          {
            name: 'email',
            type: 'string',
            optional: false,
            unique: true,
            isId: false
          },
          {
            name: 'name',
            type: 'string',
            optional: true,
            unique: false,
            isId: false
          }
        ],
        hasSoftDelete: false,
        hasAuditing: true
      };

      const template = `import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './{{entityNameLower}}.service';
import { Create{{entityName}}Dto } from './dto/create-{{entityNameLower}}.dto';
import { Update{{entityName}}Dto } from './dto/update-{{entityNameLower}}.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('{{entityNameLowerPlural}}')
@Controller('{{entityNameLowerPlural}}')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class {{entityName}}sController {
  constructor(private readonly {{entityNameLowerPlural}}Service: UsersService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new {{entityNameLower}}' })
  @ApiResponse({ status: 201, description: 'The {{entityNameLower}} has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() create{{entityName}}Dto: Create{{entityName}}Dto) {
    return this.{{entityNameLowerPlural}}Service.create(create{{entityName}}Dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all {{entityNameLowerPlural}}' })
  @ApiResponse({ status: 200, description: 'Return all {{entityNameLowerPlural}}.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@Query() query: any) {
    return this.{{entityNameLowerPlural}}Service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a {{entityNameLower}} by id' })
  @ApiResponse({ status: 200, description: 'Return the {{entityNameLower}}.' })
  @ApiResponse({ status: 404, description: '{{entityName}} not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findOne(@Param('id') id: string) {
    return this.{{entityNameLowerPlural}}Service.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a {{entityNameLower}}' })
  @ApiResponse({ status: 200, description: 'The {{entityNameLower}} has been successfully updated.' })
  @ApiResponse({ status: 404, description: '{{entityName}} not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  update(@Param('id') id: string, @Body() update{{entityName}}Dto: Update{{entityName}}Dto) {
    return this.{{entityNameLowerPlural}}Service.update(id, update{{entityName}}Dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a {{entityNameLower}}' })
  @ApiResponse({ status: 204, description: 'The {{entityNameLower}} has been successfully deleted.' })
  @ApiResponse({ status: 404, description: '{{entityName}} not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  remove(@Param('id') id: string) {
    return this.{{entityNameLowerPlural}}Service.remove(id);
  }
}`;

      const result = renderer.renderTemplate(template, context);
      expect(result).toMatchSnapshot();
    });

    it('should generate consistent service template', () => {
      const context = {
        entityName: 'User',
        entityNamePlural: 'users',
        entityNameLower: 'user',
        entityNameLowerPlural: 'users',
        fields: [
          {
            name: 'id',
            type: 'uuid',
            optional: false,
            unique: false,
            isId: true
          },
          {
            name: 'email',
            type: 'string',
            optional: false,
            unique: true,
            isId: false
          },
          {
            name: 'name',
            type: 'string',
            optional: true,
            unique: false,
            isId: false
          }
        ],
        hasSoftDelete: false,
        hasAuditing: true
      };

      const template = `import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Create{{entityName}}Dto } from './dto/create-{{entityNameLower}}.dto';
import { Update{{entityName}}Dto } from './dto/update-{{entityNameLower}}.dto';
import { {{entityName}}sRepository } from './{{entityNameLower}}.repository';
import { {{entityName}} } from './entities/{{entityNameLower}}.entity';

@Injectable()
export class {{entityName}}sService {
  constructor(private readonly {{entityNameLowerPlural}}Repository: {{entityName}}sRepository) {}

  async create(create{{entityName}}Dto: Create{{entityName}}Dto): Promise<{{entityName}}> {
    // Check if {{entityNameLower}} already exists
    const existing{{entityName}} = await this.{{entityNameLowerPlural}}Repository.findByEmail(create{{entityName}}Dto.email);
    if (existing{{entityName}}) {
      throw new ConflictException('{{entityName}} with this email already exists');
    }

    return this.{{entityNameLowerPlural}}Repository.create(create{{entityName}}Dto);
  }

  async findAll(query: any): Promise<{{entityName}}[]> {
    return this.{{entityNameLowerPlural}}Repository.findAll(query);
  }

  async findOne(id: string): Promise<{{entityName}}> {
    const {{entityNameLower}} = await this.{{entityNameLowerPlural}}Repository.findById(id);
    if (!{{entityNameLower}}) {
      throw new NotFoundException('{{entityName}} not found');
    }
    return {{entityNameLower}};
  }

  async update(id: string, update{{entityName}}Dto: Update{{entityName}}Dto): Promise<{{entityName}}> {
    const {{entityNameLower}} = await this.findOne(id);
    
    // Check if email is being updated and if it already exists
    if (update{{entityName}}Dto.email && update{{entityName}}Dto.email !== {{entityNameLower}}.email) {
      const existing{{entityName}} = await this.{{entityNameLowerPlural}}Repository.findByEmail(update{{entityName}}Dto.email);
      if (existing{{entityName}}) {
        throw new ConflictException('{{entityName}} with this email already exists');
      }
    }

    return this.{{entityNameLowerPlural}}Repository.update(id, update{{entityName}}Dto);
  }

  async remove(id: string): Promise<void> {
    const {{entityNameLower}} = await this.findOne(id);
    await this.{{entityNameLowerPlural}}Repository.delete(id);
  }
}`;

      const result = renderer.renderTemplate(template, context);
      expect(result).toMatchSnapshot();
    });

    it('should generate consistent DTO template', () => {
      const context = {
        entityName: 'User',
        entityNameLower: 'user',
        fields: [
          {
            name: 'id',
            type: 'uuid',
            optional: false,
            unique: false,
            isId: true
          },
          {
            name: 'email',
            type: 'string',
            optional: false,
            unique: true,
            isId: false
          },
          {
            name: 'name',
            type: 'string',
            optional: true,
            unique: false,
            isId: false
          },
          {
            name: 'password',
            type: 'string',
            optional: false,
            unique: false,
            isId: false
          }
        ]
      };

      const template = `import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class Create{{entityName}}Dto {
  @ApiProperty({ description: 'Email address', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Full name', example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: 'Password', example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}`;

      const result = renderer.renderTemplate(template, context);
      expect(result).toMatchSnapshot();
    });
  });
});
