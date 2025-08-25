import { Command } from '@oclif/core';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

export default class Doctor extends Command {
  static override description = 'Validate project setup and environment';

  static override examples = [
    '$ backend-generator doctor',
    '$ backend-generator doctor --check-db',
    '$ backend-generator doctor --check-migrations'
  ];

  async run(): Promise<void> {
    try {
      console.log(chalk.blue('🔍 Running project diagnostics...\n'));

      const results = await this.runDiagnostics();

      this.displayResults(results);

      if (results.some(r => !r.status)) {
        this.exit(1);
      } else {
        console.log(chalk.green('\n✅ All checks passed! Your project is ready to go.'));
      }

    } catch (error) {
      this.error(`Failed to run diagnostics: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async runDiagnostics(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];

    // Check Node.js version
    results.push(await this.checkNodeVersion());

    // Check if we're in a NestJS project
    results.push(await this.checkNestJSProject());

    // Check package.json
    results.push(await this.checkPackageJson());

    // Check .env file
    results.push(await this.checkEnvFile());

    // Check database connection
    results.push(await this.checkDatabaseConnection());

    // Check Prisma setup
    results.push(await this.checkPrismaSetup());

    // Check pending migrations
    results.push(await this.checkPendingMigrations());

    // Check test setup
    results.push(await this.checkTestSetup());

    return results;
  }

  private async checkNodeVersion(): Promise<DiagnosticResult> {
    const spinner = ora('Checking Node.js version...').start();

    try {
      const { stdout } = await execa('node', ['--version']);
      const version = stdout.trim();
      const majorVersion = parseInt(version.slice(1).split('.')[0] || '0');

      if (majorVersion >= 18) {
        spinner.succeed(`Node.js version: ${version}`);
        return { name: 'Node.js Version', status: true, message: `Version ${version} is supported` };
      } else {
        spinner.fail(`Node.js version ${version} is not supported`);
        return { name: 'Node.js Version', status: false, message: `Version ${version} is not supported. Please use Node.js 18 or higher.` };
      }
    } catch (error) {
      spinner.fail('Failed to check Node.js version');
      return { name: 'Node.js Version', status: false, message: 'Could not determine Node.js version' };
    }
  }

  private async checkNestJSProject(): Promise<DiagnosticResult> {
    const spinner = ora('Checking NestJS project structure...').start();

    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (!(await fs.pathExists(packageJsonPath))) {
        spinner.fail('Not in a NestJS project directory');
        return { name: 'NestJS Project', status: false, message: 'No package.json found. Please run this command from your NestJS project root.' };
      }

      const packageJson = await fs.readJson(packageJsonPath);
      const hasNestJS = packageJson.dependencies?.['@nestjs/core'] || packageJson.devDependencies?.['@nestjs/core'];

      if (hasNestJS) {
        spinner.succeed('NestJS project detected');
        return { name: 'NestJS Project', status: true, message: 'Valid NestJS project structure' };
      } else {
        spinner.fail('Not a NestJS project');
        return { name: 'NestJS Project', status: false, message: 'This does not appear to be a NestJS project. Please run this command from your NestJS project root.' };
      }
    } catch (error) {
      spinner.fail('Failed to check NestJS project');
      return { name: 'NestJS Project', status: false, message: 'Could not read package.json' };
    }
  }

  private async checkPackageJson(): Promise<DiagnosticResult> {
    const spinner = ora('Checking package.json...').start();

    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);

      const requiredDeps = ['@nestjs/core', '@nestjs/common', '@nestjs/platform-express'];
      const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies?.[dep]);

      if (missingDeps.length === 0) {
        spinner.succeed('Package.json is valid');
        return { name: 'Package.json', status: true, message: 'All required dependencies are present' };
      } else {
        spinner.fail('Missing required dependencies');
        return { name: 'Package.json', status: false, message: `Missing dependencies: ${missingDeps.join(', ')}` };
      }
    } catch (error) {
      spinner.fail('Failed to check package.json');
      return { name: 'Package.json', status: false, message: 'Could not read package.json' };
    }
  }

  private async checkEnvFile(): Promise<DiagnosticResult> {
    const spinner = ora('Checking .env file...').start();

    try {
      const envPath = path.join(process.cwd(), '.env');
      if (!(await fs.pathExists(envPath))) {
        spinner.warn('No .env file found');
        return { name: '.env File', status: false, message: 'No .env file found. Please create one based on .env.example' };
      }

      const envContent = await fs.readFile(envPath, 'utf-8');
      const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
      const missingVars = requiredVars.filter(varName => !envContent.includes(`${varName}=`));

      if (missingVars.length === 0) {
        spinner.succeed('.env file is properly configured');
        return { name: '.env File', status: true, message: 'All required environment variables are present' };
      } else {
        spinner.fail('Missing required environment variables');
        return { name: '.env File', status: false, message: `Missing variables: ${missingVars.join(', ')}` };
      }
    } catch (error) {
      spinner.fail('Failed to check .env file');
      return { name: '.env File', status: false, message: 'Could not read .env file' };
    }
  }

  private async checkDatabaseConnection(): Promise<DiagnosticResult> {
    const spinner = ora('Checking database connection...').start();

    try {
      // This would actually test the database connection
      // For now, just check if DATABASE_URL is set
      const envPath = path.join(process.cwd(), '.env');
      if (await fs.pathExists(envPath)) {
        const envContent = await fs.readFile(envPath, 'utf-8');
        if (envContent.includes('DATABASE_URL=')) {
          spinner.succeed('Database URL is configured');
          return { name: 'Database Connection', status: true, message: 'DATABASE_URL is configured (connection not tested)' };
        }
      }

      spinner.fail('Database URL not configured');
      return { name: 'Database Connection', status: false, message: 'DATABASE_URL not found in .env file' };
    } catch (error) {
      spinner.fail('Failed to check database connection');
      return { name: 'Database Connection', status: false, message: 'Could not check database configuration' };
    }
  }

  private async checkPrismaSetup(): Promise<DiagnosticResult> {
    const spinner = ora('Checking Prisma setup...').start();

    try {
      const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
      if (!(await fs.pathExists(schemaPath))) {
        spinner.fail('Prisma schema not found');
        return { name: 'Prisma Setup', status: false, message: 'No prisma/schema.prisma file found' };
      }

      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);
      const hasPrisma = packageJson.dependencies?.['@prisma/client'] || packageJson.devDependencies?.['prisma'];

      if (hasPrisma) {
        spinner.succeed('Prisma is properly configured');
        return { name: 'Prisma Setup', status: true, message: 'Prisma schema and dependencies are present' };
      } else {
        spinner.fail('Prisma dependencies missing');
        return { name: 'Prisma Setup', status: false, message: 'Prisma dependencies not found in package.json' };
      }
    } catch (error) {
      spinner.fail('Failed to check Prisma setup');
      return { name: 'Prisma Setup', status: false, message: 'Could not check Prisma configuration' };
    }
  }

  private async checkPendingMigrations(): Promise<DiagnosticResult> {
    const spinner = ora('Checking for pending migrations...').start();

    try {
      // This would actually check for pending migrations
      // For now, just check if migrations directory exists
      const migrationsPath = path.join(process.cwd(), 'prisma', 'migrations');
      if (await fs.pathExists(migrationsPath)) {
        spinner.succeed('Migrations directory exists');
        return { name: 'Pending Migrations', status: true, message: 'Migrations directory found (pending migrations not checked)' };
      } else {
        spinner.warn('No migrations directory found');
        return { name: 'Pending Migrations', status: true, message: 'No migrations directory found (this is normal for new projects)' };
      }
    } catch (error) {
      spinner.fail('Failed to check migrations');
      return { name: 'Pending Migrations', status: false, message: 'Could not check migrations' };
    }
  }

  private async checkTestSetup(): Promise<DiagnosticResult> {
    const spinner = ora('Checking test setup...').start();

    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);
      const hasJest = packageJson.devDependencies?.['jest'] || packageJson.dependencies?.['jest'];

      if (hasJest) {
        spinner.succeed('Test setup is configured');
        return { name: 'Test Setup', status: true, message: 'Jest is configured for testing' };
      } else {
        spinner.fail('Test setup missing');
        return { name: 'Test Setup', status: false, message: 'Jest not found in dependencies' };
      }
    } catch (error) {
      spinner.fail('Failed to check test setup');
      return { name: 'Test Setup', status: false, message: 'Could not check test configuration' };
    }
  }

  private displayResults(results: DiagnosticResult[]): void {
    console.log(chalk.bold('\n📋 Diagnostic Results:\n'));

    for (const result of results) {
      const icon = result.status ? '✅' : '❌';
      const color = result.status ? chalk.green : chalk.red;
      
      console.log(`${icon} ${color(result.name)}`);
      console.log(`   ${result.message}\n`);
    }
  }
}

interface DiagnosticResult {
  name: string;
  status: boolean;
  message: string;
}
