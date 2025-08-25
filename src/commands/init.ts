import { Command, Flags } from '@oclif/core';
import { TemplateCopier } from '../lib/writer/copier';
import { InitPrompts } from '../lib/prompts/init-prompts';
import { TemplateContext } from '../lib/types';
import { kebabCase, pascalCase, camelCase } from 'change-case';
import path from 'path';
import fs from 'fs-extra';
import { execa } from 'execa';
import chalk from 'chalk';
import ora from 'ora';

export default class Init extends Command {
  static override description = 'Generate a new NestJS project';

  static override examples = [
    '$ backend-generator init',
    '$ backend-generator init --name my-app',
    '$ backend-generator init --name my-app --api-base /api/v1'
  ];

  static override flags = {
    name: Flags.string({
      char: 'n',
      description: 'Project name',
      required: false
    }),
    'api-base': Flags.string({
      char: 'a',
      description: 'API base path',
      default: '/api',
      required: false
    }),
    'api-version': Flags.string({
      char: 'v',
      description: 'API version',
      default: 'v1',
      required: false
    }),
    'skip-install': Flags.boolean({
      description: 'Skip npm install',
      default: false
    }),
    'skip-git': Flags.boolean({
      description: 'Skip git initialization',
      default: false
    })
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Init);

    try {
      // Get project configuration
      const config = await this.getProjectConfig(flags);
      
      // Create project directory
      const projectPath = path.resolve(config.projectName);
      await this.createProjectDirectory(projectPath);

      // Generate project context
      const context = this.createTemplateContext(config);

      // Copy templates
      await this.copyTemplates(projectPath, context);

      // Install dependencies
      if (!flags['skip-install']) {
        await this.installDependencies(projectPath);
      }

      // Initialize git
      if (!flags['skip-git']) {
        await this.initializeGit(projectPath);
      }

      // Post-installation setup
      await this.postInstallationSetup(projectPath);

      this.logSuccess(config.projectName, projectPath);

    } catch (error) {
      this.error(`Failed to create project: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getProjectConfig(flags: any) {
    if (flags.name) {
      // Use flags for non-interactive mode
      return {
        projectName: flags.name,
        apiBase: flags['api-base'],
        apiVersion: flags['api-version'],
        securityFeatures: [],
        complianceNeeds: [],
        authProviders: [{ name: 'email-password', enabled: true, description: 'Email + password authentication with JWT' }],
        enableSentry: false,
        enableGitHubActions: false,
        optionalServices: []
      };
    }

    // Interactive mode
    return await InitPrompts.runAllPrompts();
  }

  private async createProjectDirectory(projectPath: string): Promise<void> {
    const spinner = ora('Creating project directory...').start();

    try {
      if (await fs.pathExists(projectPath)) {
        spinner.fail('Project directory already exists');
        throw new Error(`Directory ${projectPath} already exists`);
      }

      await fs.ensureDir(projectPath);
      spinner.succeed('Project directory created');
    } catch (error) {
      spinner.fail('Failed to create project directory');
      throw error;
    }
  }

  private createTemplateContext(config: any): TemplateContext {
    return {
      projectName: config.projectName,
      projectNameKebab: kebabCase(config.projectName),
      projectNamePascal: pascalCase(config.projectName),
      projectNameCamel: camelCase(config.projectName),
      apiBase: config.apiBase,
      apiVersion: config.apiVersion,
      securityFeatures: config.securityFeatures,
      complianceNeeds: config.complianceNeeds,
      authProviders: config.authProviders,
      enableSentry: config.enableSentry,
      enableGitHubActions: config.enableGitHubActions,
      optionalServices: config.optionalServices
    };
  }

  private async copyTemplates(projectPath: string, context: TemplateContext): Promise<void> {
    const spinner = ora('Generating project files...').start();

    try {
      // Get template path
      const templatePath = path.join(__dirname, '../../templates/project');
      
      if (!(await fs.pathExists(templatePath))) {
        spinner.fail('Template directory not found');
        throw new Error('Template directory not found. Please ensure templates are properly installed.');
      }

      // Copy template files
      await TemplateCopier.copyTemplate(templatePath, projectPath, context, true);
      
      spinner.succeed('Project files generated');
    } catch (error) {
      spinner.fail('Failed to generate project files');
      throw error;
    }
  }

  private async installDependencies(projectPath: string): Promise<void> {
    const spinner = ora('Installing dependencies...').start();

    try {
      await execa('npm', ['install'], { 
        cwd: projectPath,
        stdio: 'pipe'
      });
      
      spinner.succeed('Dependencies installed');
    } catch (error) {
      spinner.fail('Failed to install dependencies');
      throw error;
    }
  }

  private async initializeGit(projectPath: string): Promise<void> {
    const spinner = ora('Initializing git repository...').start();

    try {
      await execa('git', ['init'], { cwd: projectPath });
      await execa('git', ['add', '.'], { cwd: projectPath });
      await execa('git', ['commit', '-m', 'Initial commit'], { cwd: projectPath });
      
      spinner.succeed('Git repository initialized');
    } catch (error) {
      spinner.warn('Failed to initialize git repository (this is optional)');
    }
  }

  private async postInstallationSetup(projectPath: string): Promise<void> {
    const spinner = ora('Running post-installation setup...').start();

    try {
      // Generate Prisma client
      await execa('npx', ['prisma', 'generate'], { 
        cwd: projectPath,
        stdio: 'pipe'
      });

      // Create initial migration
      await execa('npx', ['prisma', 'migrate', 'dev', '--name', 'init'], { 
        cwd: projectPath,
        stdio: 'pipe'
      });

      // Format code with Prettier
      await execa('npx', ['prettier', '--write', '.'], { 
        cwd: projectPath,
        stdio: 'pipe'
      });

      spinner.succeed('Post-installation setup completed');
    } catch (error) {
      spinner.warn('Some post-installation steps failed (this is normal for first-time setup)');
    }
  }

  private logSuccess(projectName: string, _projectPath: string): void {
    console.log('\n' + chalk.green('✅ Project created successfully!') + '\n');
    
    console.log(chalk.bold('Next steps:'));
    console.log(`  cd ${projectName}`);
    console.log('  npm run start:dev');
    console.log('\n' + chalk.blue('Your NestJS application will be available at:'));
    console.log('  http://localhost:3000');
    console.log('  http://localhost:3000/docs (Swagger documentation)');
    console.log('  http://localhost:3000/health (Health check)');
    
    console.log('\n' + chalk.yellow('Don\'t forget to:'));
    console.log('  1. Update your .env file with your database credentials');
    console.log('  2. Configure your authentication providers');
    console.log('  3. Set up your database and run migrations');
    
    console.log('\n' + chalk.green('Happy coding! 🚀'));
  }
}
