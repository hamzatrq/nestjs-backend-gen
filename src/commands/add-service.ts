import { Command, Flags } from '@oclif/core';
import { OPTIONAL_SERVICES } from '../lib/constants';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';

export default class AddService extends Command {
  static override description = 'Scaffold optional services';

  static override examples = [
    '$ backend-generator add service',
    '$ backend-generator add service --service email',
    '$ backend-generator add service --service email,cache,storage'
  ];

  static override flags = {
    service: Flags.string({
      char: 's',
      description: 'Service(s) to scaffold (comma-separated)',
      required: false
    })
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AddService);

    try {
      // Get services to scaffold
      const servicesToScaffold = await this.getServicesToScaffold(flags);
      
      if (servicesToScaffold.length === 0) {
        this.log('No services selected. Exiting.');
        return;
      }

      // Scaffold services
      await this.scaffoldServices(servicesToScaffold);

      this.logSuccess(servicesToScaffold);

    } catch (error) {
      this.error(`Failed to scaffold services: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getServicesToScaffold(flags: any): Promise<string[]> {
    if (flags.service) {
      // Use flags for non-interactive mode
      return flags.service.split(',').map((s: string) => s.trim());
    }

    // Interactive mode
    const { services } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'services',
        message: 'Which services would you like to scaffold?',
        choices: OPTIONAL_SERVICES.map(service => ({
          name: `${service.description} (${service.name})`,
          value: service.name,
          checked: service.enabled
        }))
      }
    ]);

    return services;
  }

  private async scaffoldServices(services: string[]): Promise<void> {
    const spinner = ora('Scaffolding services...').start();

    try {
      for (const serviceName of services) {
        await this.scaffoldService(serviceName);
      }
      
      spinner.succeed('Services scaffolded');
    } catch (error) {
      spinner.fail('Failed to scaffold services');
      throw error;
    }
  }

  private async scaffoldService(serviceName: string): Promise<void> {
    const service = OPTIONAL_SERVICES.find(s => s.name === serviceName);
    if (!service) {
      throw new Error(`Unknown service: ${serviceName}`);
    }

    // Generate service modules
    const { ServiceGenerator } = await import('../lib/services/service-generator');
    await ServiceGenerator.generateModules([serviceName]);

    // Update environment variables
    const { EnvWriter } = await import('../lib/writer/env-writer');
    await EnvWriter.updateServiceVariables([serviceName]);
  }

  private logSuccess(services: string[]): void {
    console.log('\n' + chalk.green(`✅ Services scaffolded: ${services.join(', ')}`) + '\n');
    
    console.log(chalk.bold('Next steps:'));
    console.log('  1. Update your .env file with service credentials');
    console.log('  2. Configure your service providers');
    console.log('  3. Test the service endpoints');
    
    console.log('\n' + chalk.blue('Available services:'));
    for (const service of services) {
      switch (service) {
        case 'email':
          console.log('  Email service: src/modules/email/');
          break;
        case 'file-storage':
          console.log('  File storage service: src/modules/storage/');
          break;
        case 'cache':
          console.log('  Cache service: src/modules/cache/');
          break;
        case 'notifications':
          console.log('  Notifications service: src/modules/notifications/');
          break;
        case 'task-scheduling':
          console.log('  Task scheduling service: src/modules/tasks/');
          break;
        case 'payments':
          console.log('  Payments service: src/modules/payments/');
          break;
        case 'search':
          console.log('  Search service: src/modules/search/');
          break;
      }
    }
    
    console.log('\n' + chalk.green('Happy coding! 🚀'));
  }
}
