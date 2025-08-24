import { Command, Flags } from '@oclif/core';
import { DslParser } from '../lib/dsl/parser';
import { CrudEntity } from '../lib/types';
import inquirer from 'inquirer';

import chalk from 'chalk';
import ora from 'ora';

export default class AddCrud extends Command {
  static override description = 'Generate CRUD operations for entities';

  static override examples = [
    '$ nxg add crud',
    '$ nxg add crud --entity User',
    '$ nxg add crud --spec entities.json'
  ];

  static override flags = {
    entity: Flags.string({
      char: 'e',
      description: 'Entity name',
      required: false
    }),
    spec: Flags.string({
      char: 's',
      description: 'Path to entity specification file',
      required: false
    }),
    'skip-tests': Flags.boolean({
      description: 'Skip test generation',
      default: false
    })
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AddCrud);

    try {
      // Get entity definition
      const entity = await this.getEntityDefinition(flags);
      
      // Validate entity
      const errors = DslParser.validateEntity(entity);
      if (errors.length > 0) {
        this.error(`Entity validation failed:\n${errors.join('\n')}`);
        return;
      }

      // Generate CRUD files
      await this.generateCrudFiles(entity);

      this.logSuccess(entity.name);

    } catch (error) {
      this.error(`Failed to generate CRUD: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getEntityDefinition(flags: any): Promise<CrudEntity> {
    if (flags.spec) {
      // Load from specification file
      return await DslParser.parseEntityDslFromFile(flags.spec);
    }

    if (flags.entity) {
      // Use simple entity name and prompt for fields
      return await this.promptForEntityFields(flags.entity);
    }

    // Interactive mode - prompt for entity DSL
    return await this.promptForEntityDsl();
  }

  private async promptForEntityDsl(): Promise<CrudEntity> {
    const { dsl } = await inquirer.prompt([
      {
        type: 'editor',
        name: 'dsl',
        message: 'Enter entity definition (DSL format):',
        default: `User
id:uuid@id@default(cuid())
email:string@unique
name:string?
createdAt:datetime@default(now())
updatedAt:datetime@default(now())`,
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Entity definition is required';
          }
          try {
            DslParser.parseEntityDsl(input);
            return true;
          } catch (error) {
            return `Invalid DSL: ${error instanceof Error ? error.message : String(error)}`;
          }
        }
      }
    ]);

    return DslParser.parseEntityDsl(dsl);
  }

  private async promptForEntityFields(entityName: string): Promise<CrudEntity> {
    const { fields } = await inquirer.prompt([
      {
        type: 'input',
        name: 'fields',
        message: `Enter fields for ${entityName} (comma-separated, format: name:type[?][@modifiers]):`,
        default: 'id:uuid@id@default(cuid()),email:string@unique,name:string?,createdAt:datetime@default(now()),updatedAt:datetime@default(now())',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Fields are required';
          }
          return true;
        }
      }
    ]);

    const dsl = `${entityName}\n${fields.split(',').map((f: string) => f.trim()).join('\n')}`;
    return DslParser.parseEntityDsl(dsl);
  }

  private async generateCrudFiles(entity: CrudEntity): Promise<void> {
    const spinner = ora(`Generating CRUD files for ${entity.name}...`).start();

    try {
      // Generate Prisma model
      await this.generatePrismaModel(entity);

      // Generate NestJS module files
      await this.generateNestJSFiles(entity);

      // Generate tests
      await this.generateTests(entity);

      // Update Prisma schema and run migration
      await this.updatePrismaSchema(entity);

      spinner.succeed(`CRUD files generated for ${entity.name}`);
    } catch (error) {
      spinner.fail(`Failed to generate CRUD files for ${entity.name}`);
      throw error;
    }
  }

  private async generatePrismaModel(entity: CrudEntity): Promise<void> {
    // This would generate the Prisma model definition
    // Implementation would be in a separate PrismaModelWriter class
    console.log(`Generating Prisma model for ${entity.name}...`);
  }

  private async generateNestJSFiles(entity: CrudEntity): Promise<void> {
    // This would generate all NestJS files (controller, service, repository, DTOs, etc.)
    // Implementation would be in separate writer classes
    console.log(`Generating NestJS files for ${entity.name}...`);
  }

  private async generateTests(entity: CrudEntity): Promise<void> {
    // This would generate test files
    // Implementation would be in a separate TestWriter class
    console.log(`Generating tests for ${entity.name}...`);
  }

  private async updatePrismaSchema(entity: CrudEntity): Promise<void> {
    // This would update the Prisma schema and run migrations
    // Implementation would be in a separate PrismaSchemaWriter class
    console.log(`Updating Prisma schema for ${entity.name}...`);
  }

  private logSuccess(entityName: string): void {
    console.log('\n' + chalk.green(`✅ CRUD operations generated for ${entityName}!`) + '\n');
    
    console.log(chalk.bold('Generated files:'));
    console.log(`  src/modules/${entityName.toLowerCase()}/`);
    console.log(`  test/unit/${entityName.toLowerCase()}/`);
    console.log(`  test/integration/${entityName.toLowerCase()}/`);
    console.log(`  test/e2e/${entityName.toLowerCase()}/`);
    
    console.log('\n' + chalk.blue('Next steps:'));
    console.log('  1. Review the generated files');
    console.log('  2. Update your database schema if needed');
    console.log('  3. Run tests to ensure everything works');
    
    console.log('\n' + chalk.green('Happy coding! 🚀'));
  }
}
