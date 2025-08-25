import { execSync } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';

const testDir = path.join(process.cwd(), 'temp-e2e-test');

describe('CLI E2E Tests', () => {
  const cliPath = path.join(process.cwd(), 'bin/run');

  beforeAll(async () => {
    // Ensure test directory is clean
    if (await fs.pathExists(testDir)) {
      await fs.remove(testDir);
    }
    await fs.mkdirp(testDir);
  });

  afterAll(async () => {
    // Clean up test directory
    if (await fs.pathExists(testDir)) {
      await fs.remove(testDir);
    }
  });

  beforeEach(async () => {
    // Clean test directory before each test
    if (await fs.pathExists(testDir)) {
      await fs.remove(testDir);
    }
    await fs.mkdirp(testDir);
  });

  describe('Init Command E2E', () => {
    it('should create a complete NestJS project structure', async () => {
      const projectName = 'test-project';
      const projectPath = path.join(testDir, projectName);

      // Mock user input for init command
      const mockInput = [
        projectName,           // projectName
        'Test project',        // description
        'Test Author',         // author
        '1.0.0',              // version
        'postgresql',          // database
        'jwt',                // authentication (first choice)
        'google',             // authentication (second choice)
        'email',              // services (first choice)
        'file-storage',       // services (second choice)
        'helmet',             // security (first choice)
        'cors',               // security (second choice)
        'rate-limiting',      // security (third choice)
        'unit',               // testing (first choice)
        'integration',        // testing (second choice)
        'e2e',                // testing (third choice)
        'yes',                // docker
        'yes',                // githubActions
        'yes'                 // sentry
      ].join('\n') + '\n';

      // Execute init command
      execSync(`echo "${mockInput}" | node ${cliPath} init`, {
        cwd: testDir,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Verify project directory was created
      expect(await fs.pathExists(projectPath)).toBe(true);

      // Verify package.json exists and has correct structure
      const packageJsonPath = path.join(projectPath, 'package.json');
      expect(await fs.pathExists(packageJsonPath)).toBe(true);
      
      const packageJson = await fs.readJson(packageJsonPath);
      expect(packageJson.name).toBe(projectName);
      expect(packageJson.description).toBe('Test project');
      expect(packageJson.author).toBe('Test Author');
      expect(packageJson.version).toBe('1.0.0');

      // Verify core directories exist
      const expectedDirs = [
        'src',
        'src/modules',
        'src/common',
        'src/config',
        'tests',
        'tests/unit',
        'tests/integration',
        'tests/e2e'
      ];

      for (const dir of expectedDirs) {
        expect(await fs.pathExists(path.join(projectPath, dir))).toBe(true);
      }

      // Verify Docker files exist
      expect(await fs.pathExists(path.join(projectPath, 'Dockerfile'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'docker-compose.yml'))).toBe(true);

      // Verify GitHub Actions workflow exists
      expect(await fs.pathExists(path.join(projectPath, '.github/workflows/ci.yml'))).toBe(true);

      // Verify environment file exists
      expect(await fs.pathExists(path.join(projectPath, '.env.example'))).toBe(true);

      // Verify Prisma schema exists
      expect(await fs.pathExists(path.join(projectPath, 'prisma/schema.prisma'))).toBe(true);
    }, 30000);

    it('should handle invalid project names gracefully', async () => {
      const invalidProjectName = 'invalid project name with spaces';
      // const projectPath = path.join(testDir, invalidProjectName);

      const mockInput = [
        invalidProjectName,    // projectName
        'Test project',        // description
        'Test Author',         // author
        '1.0.0',              // version
        'postgresql',          // database
        'jwt',                // authentication
        '',                   // no additional services
        'helmet',             // security
        'unit',               // testing
        'no',                 // docker
        'no',                 // githubActions
        'no'                  // sentry
      ].join('\n') + '\n';

      // Execute init command
      execSync(`echo "${mockInput}" | node ${cliPath} init`, {
        cwd: testDir,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Verify project was created with sanitized name
      const sanitizedPath = path.join(testDir, 'invalid-project-name-with-spaces');
      expect(await fs.pathExists(sanitizedPath)).toBe(true);
    }, 30000);

    it('should create minimal project with default options', async () => {
      const projectName = 'minimal-project';
      const projectPath = path.join(testDir, projectName);

      const mockInput = [
        projectName,           // projectName
        'Minimal project',     // description
        'Test Author',         // author
        '1.0.0',              // version
        'postgresql',          // database
        'jwt',                // authentication
        '',                   // no additional services
        'helmet',             // security
        'unit',               // testing
        'no',                 // docker
        'no',                 // githubActions
        'no'                  // sentry
      ].join('\n') + '\n';

      // Execute init command
      execSync(`echo "${mockInput}" | node ${cliPath} init`, {
        cwd: testDir,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Verify project was created
      expect(await fs.pathExists(projectPath)).toBe(true);

      // Verify package.json has minimal dependencies
      const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));
      expect(packageJson.dependencies).toHaveProperty('@nestjs/core');
      expect(packageJson.dependencies).toHaveProperty('@nestjs/common');
      expect(packageJson.dependencies).toHaveProperty('@nestjs/config');
      expect(packageJson.dependencies).toHaveProperty('@nestjs/jwt');
      expect(packageJson.dependencies).toHaveProperty('@nestjs/passport');
      expect(packageJson.dependencies).toHaveProperty('prisma');
      expect(packageJson.dependencies).toHaveProperty('@prisma/client');

      // Verify Docker files don't exist
      expect(await fs.pathExists(path.join(projectPath, 'Dockerfile'))).toBe(false);
      expect(await fs.pathExists(path.join(projectPath, 'docker-compose.yml'))).toBe(false);

      // Verify GitHub Actions workflow doesn't exist
      expect(await fs.pathExists(path.join(projectPath, '.github/workflows/ci.yml'))).toBe(false);
    }, 30000);
  });

  describe('AddCrud Command E2E', () => {
    let projectPath: string;

    beforeEach(async () => {
      // Create a test project first
      const projectName = 'crud-test-project';
      projectPath = path.join(testDir, projectName);

      const mockInput = [
        projectName,           // projectName
        'CRUD test project',   // description
        'Test Author',         // author
        '1.0.0',              // version
        'postgresql',          // database
        'jwt',                // authentication
        '',                   // no additional services
        'helmet',             // security
        'unit',               // testing
        'no',                 // docker
        'no',                 // githubActions
        'no'                  // sentry
      ].join('\n') + '\n';

      execSync(`echo "${mockInput}" | node ${cliPath} init`, {
        cwd: testDir,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
    });

    it('should generate CRUD for a simple entity', async () => {
      const dsl = `User
id:uuid@id@default(cuid())
email:string@unique
name:string?
createdAt:datetime@default(now())
updatedAt:datetime@default(now())`;

      const mockInput = [
        dsl,                   // DSL
        'yes',                 // generate tests
        'yes'                  // generate docs
      ].join('\n') + '\n';

      // Execute add-crud command
      execSync(`echo "${mockInput}" | node ${cliPath} add crud`, {
        cwd: projectPath,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Verify CRUD files were created
      const expectedFiles = [
        'src/modules/users/users.module.ts',
        'src/modules/users/users.controller.ts',
        'src/modules/users/users.service.ts',
        'src/modules/users/users.repository.ts',
        'src/modules/users/dto/create-user.dto.ts',
        'src/modules/users/dto/update-user.dto.ts',
        'src/modules/users/entities/user.entity.ts',
        'tests/unit/users/users.service.spec.ts',
        'tests/integration/users/users.controller.spec.ts'
      ];

      for (const file of expectedFiles) {
        expect(await fs.pathExists(path.join(projectPath, file))).toBe(true);
      }

      // Verify Prisma schema was updated
      const schemaPath = path.join(projectPath, 'prisma/schema.prisma');
      const schemaContent = await fs.readFile(schemaPath, 'utf8');
      expect(schemaContent).toContain('model User {');
      expect(schemaContent).toContain('id String @id @default(cuid())');
      expect(schemaContent).toContain('email String @unique');
      expect(schemaContent).toContain('name String?');
      expect(schemaContent).toContain('createdAt DateTime @default(now())');
      expect(schemaContent).toContain('updatedAt DateTime @updatedAt');
    }, 30000);

    it('should generate CRUD with relationships', async () => {
      const dsl = `Post
id:uuid@id@default(cuid())
title:string
content:text?
authorId:uuid@relation(User,many-to-one)
publishedAt:datetime?`;

      const mockInput = [
        dsl,                   // DSL
        'yes',                 // generate tests
        'yes'                  // generate docs
      ].join('\n') + '\n';

      // Execute add-crud command
      execSync(`echo "${mockInput}" | node ${cliPath} add crud`, {
        cwd: projectPath,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Verify CRUD files were created
      const expectedFiles = [
        'src/modules/posts/posts.module.ts',
        'src/modules/posts/posts.controller.ts',
        'src/modules/posts/posts.service.ts',
        'src/modules/posts/posts.repository.ts',
        'src/modules/posts/dto/create-post.dto.ts',
        'src/modules/posts/dto/update-post.dto.ts',
        'src/modules/posts/entities/post.entity.ts'
      ];

      for (const file of expectedFiles) {
        expect(await fs.pathExists(path.join(projectPath, file))).toBe(true);
      }

      // Verify Prisma schema was updated with relationship
      const schemaPath = path.join(projectPath, 'prisma/schema.prisma');
      const schemaContent = await fs.readFile(schemaPath, 'utf8');
      expect(schemaContent).toContain('model Post {');
      expect(schemaContent).toContain('authorId String');
      expect(schemaContent).toContain('author User @relation(fields: [authorId], references: [id])');
    }, 30000);

    it('should handle invalid DSL gracefully', async () => {
      const invalidDsl = `User
invalid-field-format`;

      const mockInput = [
        invalidDsl,            // DSL
        'yes',                 // generate tests
        'yes'                  // generate docs
      ].join('\n') + '\n';

      // Execute add-crud command and expect it to fail
      expect(() => {
        execSync(`echo "${mockInput}" | node ${cliPath} add crud`, {
          cwd: projectPath,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
      }).toThrow();
    }, 30000);
  });

  describe('AddAuth Command E2E', () => {
    let projectPath: string;

    beforeEach(async () => {
      // Create a test project first
      const projectName = 'auth-test-project';
      projectPath = path.join(testDir, projectName);

      const mockInput = [
        projectName,           // projectName
        'Auth test project',   // description
        'Test Author',         // author
        '1.0.0',              // version
        'postgresql',          // database
        'jwt',                // authentication
        '',                   // no additional services
        'helmet',             // security
        'unit',               // testing
        'no',                 // docker
        'no',                 // githubActions
        'no'                  // sentry
      ].join('\n') + '\n';

      execSync(`echo "${mockInput}" | node ${cliPath} init`, {
        cwd: testDir,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
    });

    it('should add Google OAuth authentication', async () => {
      const mockInput = [
        'google',              // provider
        'test-client-id',      // client ID
        'test-client-secret',  // client secret
        'http://localhost:3000/auth/google/callback'  // callback URL
      ].join('\n') + '\n';

      // Execute add-auth command
      execSync(`echo "${mockInput}" | node ${cliPath} add auth`, {
        cwd: projectPath,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Verify auth files were created
      const expectedFiles = [
        'src/modules/auth/strategies/google.strategy.ts',
        'src/modules/auth/guards/google-auth.guard.ts'
      ];

      for (const file of expectedFiles) {
        expect(await fs.pathExists(path.join(projectPath, file))).toBe(true);
      }

      // Verify environment variables were added
      const envPath = path.join(projectPath, '.env.example');
      const envContent = await fs.readFile(envPath, 'utf8');
      expect(envContent).toContain('GOOGLE_CLIENT_ID=');
      expect(envContent).toContain('GOOGLE_CLIENT_SECRET=');
      expect(envContent).toContain('GOOGLE_CALLBACK_URL=');
    }, 30000);

    it('should add GitHub OAuth authentication', async () => {
      const mockInput = [
        'github',              // provider
        'test-client-id',      // client ID
        'test-client-secret',  // client secret
        'http://localhost:3000/auth/github/callback'  // callback URL
      ].join('\n') + '\n';

      // Execute add-auth command
      execSync(`echo "${mockInput}" | node ${cliPath} add auth`, {
        cwd: projectPath,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Verify auth files were created
      const expectedFiles = [
        'src/modules/auth/strategies/github.strategy.ts',
        'src/modules/auth/guards/github-auth.guard.ts'
      ];

      for (const file of expectedFiles) {
        expect(await fs.pathExists(path.join(projectPath, file))).toBe(true);
      }

      // Verify environment variables were added
      const envPath = path.join(projectPath, '.env.example');
      const envContent = await fs.readFile(envPath, 'utf8');
      expect(envContent).toContain('GITHUB_CLIENT_ID=');
      expect(envContent).toContain('GITHUB_CLIENT_SECRET=');
      expect(envContent).toContain('GITHUB_CALLBACK_URL=');
    }, 30000);
  });

  describe('AddService Command E2E', () => {
    let projectPath: string;

    beforeEach(async () => {
      // Create a test project first
      const projectName = 'service-test-project';
      projectPath = path.join(testDir, projectName);

      const mockInput = [
        projectName,           // projectName
        'Service test project', // description
        'Test Author',         // author
        '1.0.0',              // version
        'postgresql',          // database
        'jwt',                // authentication
        '',                   // no additional services
        'helmet',             // security
        'unit',               // testing
        'no',                 // docker
        'no',                 // githubActions
        'no'                  // sentry
      ].join('\n') + '\n';

      execSync(`echo "${mockInput}" | node ${cliPath} init`, {
        cwd: testDir,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
    });

    it('should add email service', async () => {
      const mockInput = [
        'email',               // service
        'smtp.gmail.com',      // SMTP host
        '587',                 // SMTP port
        'test@example.com',    // email
        'test-password'        // password
      ].join('\n') + '\n';

      // Execute add-service command
      execSync(`echo "${mockInput}" | node ${cliPath} add service`, {
        cwd: projectPath,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Verify service files were created
      const expectedFiles = [
        'src/modules/email/email.module.ts',
        'src/modules/email/email.service.ts',
        'src/modules/email/email.controller.ts'
      ];

      for (const file of expectedFiles) {
        expect(await fs.pathExists(path.join(projectPath, file))).toBe(true);
      }

      // Verify environment variables were added
      const envPath = path.join(projectPath, '.env.example');
      const envContent = await fs.readFile(envPath, 'utf8');
      expect(envContent).toContain('SMTP_HOST=');
      expect(envContent).toContain('SMTP_PORT=');
      expect(envContent).toContain('SMTP_USER=');
      expect(envContent).toContain('SMTP_PASS=');
    }, 30000);

    it('should add file storage service', async () => {
      const mockInput = [
        'file-storage',        // service
        'aws',                 // provider
        'test-bucket',         // bucket name
        'us-east-1',           // region
        'test-access-key',     // access key
        'test-secret-key'      // secret key
      ].join('\n') + '\n';

      // Execute add-service command
      execSync(`echo "${mockInput}" | node ${cliPath} add service`, {
        cwd: projectPath,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Verify service files were created
      const expectedFiles = [
        'src/modules/file-storage/file-storage.module.ts',
        'src/modules/file-storage/file-storage.service.ts',
        'src/modules/file-storage/file-storage.controller.ts'
      ];

      for (const file of expectedFiles) {
        expect(await fs.pathExists(path.join(projectPath, file))).toBe(true);
      }

      // Verify environment variables were added
      const envPath = path.join(projectPath, '.env.example');
      const envContent = await fs.readFile(envPath, 'utf8');
      expect(envContent).toContain('AWS_ACCESS_KEY_ID=');
      expect(envContent).toContain('AWS_SECRET_ACCESS_KEY=');
      expect(envContent).toContain('AWS_REGION=');
      expect(envContent).toContain('AWS_S3_BUCKET=');
    }, 30000);
  });

  describe('Doctor Command E2E', () => {
    let projectPath: string;

    beforeEach(async () => {
      // Create a test project first
      const projectName = 'doctor-test-project';
      projectPath = path.join(testDir, projectName);

      const mockInput = [
        projectName,           // projectName
        'Doctor test project', // description
        'Test Author',         // author
        '1.0.0',              // version
        'postgresql',          // database
        'jwt',                // authentication
        '',                   // no additional services
        'helmet',             // security
        'unit',               // testing
        'no',                 // docker
        'no',                 // githubActions
        'no'                  // sentry
      ].join('\n') + '\n';

      execSync(`echo "${mockInput}" | node ${cliPath} init`, {
        cwd: testDir,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
    });

    it('should run health check and report project status', async () => {
      // Execute doctor command
      const result = execSync(`node ${cliPath} doctor`, {
        cwd: projectPath,
        encoding: 'utf8'
      });

      // Verify doctor command output
      expect(result).toContain('Project Health Check');
      expect(result).toContain('✅ Project structure');
      expect(result).toContain('✅ Package.json');
      expect(result).toContain('✅ Dependencies');
      expect(result).toContain('✅ Configuration files');
    }, 30000);
  });
});
