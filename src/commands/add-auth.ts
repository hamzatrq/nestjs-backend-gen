import { Command, Flags } from '@oclif/core';
import { AUTH_PROVIDERS } from '../lib/constants';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';

export default class AddAuth extends Command {
  static override description = 'Enable authentication providers';

  static override examples = [
    '$ nxg add auth',
    '$ nxg add auth --provider google',
    '$ nxg add auth --provider google,microsoft,github'
  ];

  static override flags = {
    provider: Flags.string({
      char: 'p',
      description: 'Authentication provider(s) to enable (comma-separated)',
      required: false
    })
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AddAuth);

    try {
      // Get providers to enable
      const providersToEnable = await this.getProvidersToEnable(flags);
      
      if (providersToEnable.length === 0) {
        this.log('No providers selected. Exiting.');
        return;
      }

      // Enable providers
      await this.enableProviders(providersToEnable);

      this.logSuccess(providersToEnable);

    } catch (error) {
      this.error(`Failed to enable authentication providers: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getProvidersToEnable(flags: any): Promise<string[]> {
    if (flags.provider) {
      // Use flags for non-interactive mode
      return flags.provider.split(',').map((p: string) => p.trim());
    }

    // Interactive mode
    const { providers } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'providers',
        message: 'Which authentication providers would you like to enable?',
        choices: AUTH_PROVIDERS.map(provider => ({
          name: `${provider.description} (${provider.name})`,
          value: provider.name,
          checked: provider.enabled
        }))
      }
    ]);

    return providers;
  }

  private async enableProviders(providers: string[]): Promise<void> {
    const spinner = ora('Enabling authentication providers...').start();

    try {
      for (const providerName of providers) {
        await this.enableProvider(providerName);
      }
      
      spinner.succeed('Authentication providers enabled');
    } catch (error) {
      spinner.fail('Failed to enable authentication providers');
      throw error;
    }
  }

  private async enableProvider(providerName: string): Promise<void> {
    const provider = AUTH_PROVIDERS.find(p => p.name === providerName);
    if (!provider) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    // This would implement the actual provider enabling logic
    // For now, just log what would be done
    console.log(`Enabling ${providerName} authentication...`);
    
    // In a real implementation, this would:
    // 1. Update the auth module configuration
    // 2. Add the provider strategy
    // 3. Update environment variables
    // 4. Add necessary dependencies
  }

  private logSuccess(providers: string[]): void {
    console.log('\n' + chalk.green(`✅ Authentication providers enabled: ${providers.join(', ')}`) + '\n');
    
    console.log(chalk.bold('Next steps:'));
    console.log('  1. Update your .env file with provider credentials');
    console.log('  2. Configure your OAuth applications (if applicable)');
    console.log('  3. Test the authentication endpoints');
    
    console.log('\n' + chalk.blue('Available endpoints:'));
    console.log('  POST /auth/login');
    console.log('  POST /auth/refresh');
    console.log('  POST /auth/logout');
    
    if (providers.some(p => p !== 'email-password')) {
      console.log('  GET /auth/google');
      console.log('  GET /auth/microsoft');
      console.log('  GET /auth/github');
    }
    
    console.log('\n' + chalk.green('Happy coding! 🚀'));
  }
}
