import Init from '../init';
import * as fs from 'fs-extra';
import * as path from 'path';
import { TemplateCopier } from '../../lib/writer/copier';

// Mock dependencies
jest.mock('fs-extra');
jest.mock('../../lib/writer/copier');
jest.mock('inquirer');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockTemplateCopier = TemplateCopier as jest.MockedClass<typeof TemplateCopier>;

describe('Init Command Integration Tests', () => {
  let initCommand: Init;
  let tempDir: string;

  beforeEach(() => {
    tempDir = path.join(process.cwd(), 'temp-test-project');
    initCommand = new Init([], {} as any);
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock fs methods
    mockFs.existsSync.mockReturnValue(false);
    mockFs.mkdirpSync.mockImplementation(() => {});
    mockFs.copySync.mockImplementation(() => {});
    mockFs.writeFileSync.mockImplementation(() => {});
    mockFs.readFileSync.mockReturnValue('{}');
    mockFs.writeJsonSync.mockImplementation(() => {});
    
    // Mock TemplateCopier methods
    (mockTemplateCopier.copyTemplate as jest.Mock).mockResolvedValue(undefined);
    (mockTemplateCopier.copyFileRaw as jest.Mock).mockResolvedValue(undefined);
    (mockTemplateCopier.createFile as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(async () => {
    // Clean up temp directory if it exists
    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
    }
  });

  describe('Project Structure Generation', () => {
    it('should create complete project structure with all directories', async () => {
      const answers = {
        projectName: 'test-project',
        apiBase: '/api',
        apiVersion: 'v1',
        securityFeatures: ['helmet', 'cors', 'rate-limiting'],
        complianceNeeds: [],
        authProviders: [
          { name: 'jwt', enabled: true, description: 'JWT authentication' },
          { name: 'google', enabled: true, description: 'Google OAuth' }
        ],
        enableSentry: true,
        enableGitHubActions: true,
        optionalServices: [
          { name: 'email', enabled: true, description: 'Email service' },
          { name: 'file-storage', enabled: true, description: 'File storage service' }
        ]
      };

      // Mock inquirer to return our test answers
      const inquirer = require('inquirer');
      (inquirer.prompt as jest.Mock).mockResolvedValue(answers);

      await initCommand.run();

      // Verify that all necessary directories were created
      expect(mockFs.mkdirpSync).toHaveBeenCalledWith(
        expect.stringContaining('src/modules')
      );
      expect(mockFs.mkdirpSync).toHaveBeenCalledWith(
        expect.stringContaining('src/common')
      );
      expect(mockFs.mkdirpSync).toHaveBeenCalledWith(
        expect.stringContaining('src/config')
      );
      expect(mockFs.mkdirpSync).toHaveBeenCalledWith(
        expect.stringContaining('tests')
      );
    });

    it('should generate package.json with correct dependencies', async () => {
      const answers = {
        projectName: 'test-project',
        description: 'Test project',
        author: 'Test Author',
        version: '1.0.0',
        database: 'postgresql',
        authentication: ['jwt'],
        services: [],
        security: ['helmet'],
        testing: ['unit'],
        docker: false,
        githubActions: false,
        sentry: false
      };

      const inquirer = require('inquirer');
      (inquirer.prompt as jest.Mock).mockResolvedValue(answers);

      await initCommand.run();

      // Verify package.json was written with correct structure
      expect(mockFs.writeJsonSync).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        expect.objectContaining({
          name: 'test-project',
          description: 'Test project',
          author: 'Test Author',
          version: '1.0.0',
          dependencies: expect.any(Object),
          devDependencies: expect.any(Object)
        }),
        expect.any(Object)
      );
    });

    it('should generate Docker files when docker option is selected', async () => {
      const answers = {
        projectName: 'test-project',
        description: 'Test project',
        author: 'Test Author',
        version: '1.0.0',
        database: 'postgresql',
        authentication: ['jwt'],
        services: [],
        security: ['helmet'],
        testing: ['unit'],
        docker: true,
        githubActions: false,
        sentry: false
      };

      const inquirer = require('inquirer');
      (inquirer.prompt as jest.Mock).mockResolvedValue(answers);

      await initCommand.run();

      // Verify Docker files were created
      expect(mockTemplateCopier.copyTemplate).toHaveBeenCalledWith(
        expect.stringContaining('Dockerfile'),
        expect.any(String),
        expect.any(Object)
      );
      expect(mockTemplateCopier.copyTemplate).toHaveBeenCalledWith(
        expect.stringContaining('docker-compose'),
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should generate GitHub Actions workflow when selected', async () => {
      const answers = {
        projectName: 'test-project',
        description: 'Test project',
        author: 'Test Author',
        version: '1.0.0',
        database: 'postgresql',
        authentication: ['jwt'],
        services: [],
        security: ['helmet'],
        testing: ['unit'],
        docker: false,
        githubActions: true,
        sentry: false
      };

      const inquirer = require('inquirer');
      (inquirer.prompt as jest.Mock).mockResolvedValue(answers);

      await initCommand.run();

      // Verify GitHub Actions workflow was created
      expect(mockTemplateCopier.copyTemplate).toHaveBeenCalledWith(
        expect.stringContaining('.github/workflows'),
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('Configuration Generation', () => {
    it('should generate correct environment variables', async () => {
      const answers = {
        projectName: 'test-project',
        description: 'Test project',
        author: 'Test Author',
        version: '1.0.0',
        database: 'postgresql',
        authentication: ['jwt', 'google'],
        services: ['email'],
        security: ['helmet', 'cors'],
        testing: ['unit'],
        docker: false,
        githubActions: false,
        sentry: true
      };

      const inquirer = require('inquirer');
      (inquirer.prompt as jest.Mock).mockResolvedValue(answers);

      await initCommand.run();

      // Verify .env.example was created with correct variables
      expect(mockTemplateCopier.copyTemplate).toHaveBeenCalledWith(
        expect.stringContaining('.env.example'),
        expect.any(String),
        expect.objectContaining({
          database: 'postgresql',
          hasJwtAuth: true,
          hasGoogleAuth: true,
          hasEmailService: true,
          hasSentry: true
        })
      );
    });

    it('should generate Prisma schema with correct configuration', async () => {
      const answers = {
        projectName: 'test-project',
        description: 'Test project',
        author: 'Test Author',
        version: '1.0.0',
        database: 'postgresql',
        authentication: ['jwt'],
        services: [],
        security: ['helmet'],
        testing: ['unit'],
        docker: false,
        githubActions: false,
        sentry: false
      };

      const inquirer = require('inquirer');
      (inquirer.prompt as jest.Mock).mockResolvedValue(answers);

      await initCommand.run();

      // Verify Prisma schema was created
      expect(mockTemplateCopier.copyTemplate).toHaveBeenCalledWith(
        expect.stringContaining('schema.prisma'),
        expect.any(String),
        expect.objectContaining({
          database: 'postgresql'
        })
      );
    });
  });

  describe('Authentication Configuration', () => {
    it('should generate JWT authentication when selected', async () => {
      const answers = {
        projectName: 'test-project',
        description: 'Test project',
        author: 'Test Author',
        version: '1.0.0',
        database: 'postgresql',
        authentication: ['jwt'],
        services: [],
        security: ['helmet'],
        testing: ['unit'],
        docker: false,
        githubActions: false,
        sentry: false
      };

      const inquirer = require('inquirer');
      (inquirer.prompt as jest.Mock).mockResolvedValue(answers);

      await initCommand.run();

      // Verify JWT auth files were created
      expect(mockTemplateCopier.copyTemplate).toHaveBeenCalledWith(
        expect.stringContaining('jwt.strategy'),
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should generate multiple authentication providers', async () => {
      const answers = {
        projectName: 'test-project',
        description: 'Test project',
        author: 'Test Author',
        version: '1.0.0',
        database: 'postgresql',
        authentication: ['jwt', 'google', 'github'],
        services: [],
        security: ['helmet'],
        testing: ['unit'],
        docker: false,
        githubActions: false,
        sentry: false
      };

      const inquirer = require('inquirer');
      (inquirer.prompt as jest.Mock).mockResolvedValue(answers);

      await initCommand.run();

      // Verify multiple auth providers were configured
      expect(mockTemplateCopier.copyTemplate).toHaveBeenCalledWith(
        expect.stringContaining('google.strategy'),
        expect.any(String),
        expect.any(Object)
      );
      expect(mockTemplateCopier.copyTemplate).toHaveBeenCalledWith(
        expect.stringContaining('github.strategy'),
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('Service Generation', () => {
    it('should generate email service when selected', async () => {
      const answers = {
        projectName: 'test-project',
        description: 'Test project',
        author: 'Test Author',
        version: '1.0.0',
        database: 'postgresql',
        authentication: ['jwt'],
        services: ['email'],
        security: ['helmet'],
        testing: ['unit'],
        docker: false,
        githubActions: false,
        sentry: false
      };

      const inquirer = require('inquirer');
      (inquirer.prompt as jest.Mock).mockResolvedValue(answers);

      await initCommand.run();

      // Verify email service was created
      expect(mockTemplateCopier.copyTemplate).toHaveBeenCalledWith(
        expect.stringContaining('email.service'),
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should generate multiple services', async () => {
      const answers = {
        projectName: 'test-project',
        description: 'Test project',
        author: 'Test Author',
        version: '1.0.0',
        database: 'postgresql',
        authentication: ['jwt'],
        services: ['email', 'file-storage', 'cache'],
        security: ['helmet'],
        testing: ['unit'],
        docker: false,
        githubActions: false,
        sentry: false
      };

      const inquirer = require('inquirer');
      (inquirer.prompt as jest.Mock).mockResolvedValue(answers);

      await initCommand.run();

      // Verify multiple services were created
      expect(mockTemplateCopier.copyTemplate).toHaveBeenCalledWith(
        expect.stringContaining('file-storage.service'),
        expect.any(String),
        expect.any(Object)
      );
      expect(mockTemplateCopier.copyTemplate).toHaveBeenCalledWith(
        expect.stringContaining('cache.service'),
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle directory creation errors gracefully', async () => {
      const answers = {
        projectName: 'test-project',
        description: 'Test project',
        author: 'Test Author',
        version: '1.0.0',
        database: 'postgresql',
        authentication: ['jwt'],
        services: [],
        security: ['helmet'],
        testing: ['unit'],
        docker: false,
        githubActions: false,
        sentry: false
      };

      const inquirer = require('inquirer');
      (inquirer.prompt as jest.Mock).mockResolvedValue(answers);

      // Mock fs.mkdirpSync to throw an error
      mockFs.mkdirpSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      await expect(initCommand.run()).rejects.toThrow('Permission denied');
    });

    it('should handle template copying errors gracefully', async () => {
      const answers = {
        projectName: 'test-project',
        description: 'Test project',
        author: 'Test Author',
        version: '1.0.0',
        database: 'postgresql',
        authentication: ['jwt'],
        services: [],
        security: ['helmet'],
        testing: ['unit'],
        docker: false,
        githubActions: false,
        sentry: false
      };

      const inquirer = require('inquirer');
      (inquirer.prompt as jest.Mock).mockResolvedValue(answers);

      // Mock TemplateCopier.copyTemplate to throw an error
      (mockTemplateCopier.copyTemplate as jest.Mock).mockRejectedValue(new Error('Template not found'));

      await expect(initCommand.run()).rejects.toThrow('Template not found');
    });
  });

  describe('Validation', () => {
    it('should validate project name format', async () => {
      const answers = {
        projectName: 'invalid project name',
        description: 'Test project',
        author: 'Test Author',
        version: '1.0.0',
        database: 'postgresql',
        authentication: ['jwt'],
        services: [],
        security: ['helmet'],
        testing: ['unit'],
        docker: false,
        githubActions: false,
        sentry: false
      };

      const inquirer = require('inquirer');
      (inquirer.prompt as jest.Mock).mockResolvedValue(answers);

      // The command should handle invalid project names
      await initCommand.run();

      // Verify that the project name was sanitized or handled appropriately
      expect(mockFs.mkdirpSync).toHaveBeenCalledWith(
        expect.stringContaining('invalid-project-name')
      );
    });

    it('should require at least one authentication method', async () => {
      const answers = {
        projectName: 'test-project',
        description: 'Test project',
        author: 'Test Author',
        version: '1.0.0',
        database: 'postgresql',
        authentication: [],
        services: [],
        security: ['helmet'],
        testing: ['unit'],
        docker: false,
        githubActions: false,
        sentry: false
      };

      const inquirer = require('inquirer');
      (inquirer.prompt as jest.Mock).mockResolvedValue(answers);

      // The command should handle empty authentication array
      await initCommand.run();

      // Verify that JWT auth is added as default
      expect(mockTemplateCopier.copyTemplate).toHaveBeenCalledWith(
        expect.stringContaining('jwt.strategy'),
        expect.any(String),
        expect.any(Object)
      );
    });
  });
});
