import inquirer from 'inquirer';
import { ProjectConfig, SecurityFeature, ComplianceNeed, AuthProvider, OptionalService } from '../types';
import { SECURITY_FEATURES, COMPLIANCE_NEEDS, AUTH_PROVIDERS, OPTIONAL_SERVICES } from '../constants';

export class InitPrompts {
  /**
   * Get project name
   */
  static async getProjectName(): Promise<string> {
    const { projectName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is your project name?',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Project name is required';
          }
          if (!/^[a-z0-9-]+$/.test(input)) {
            return 'Project name must be lowercase with only letters, numbers, and hyphens';
          }
          return true;
        },
        filter: (input: string) => input.trim().toLowerCase()
      }
    ]);

    return projectName;
  }

  /**
   * Get API base path
   */
  static async getApiBase(): Promise<string> {
    const { apiBase } = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiBase',
        message: 'What is your API base path?',
        default: '/api',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'API base path is required';
          }
          if (!input.startsWith('/')) {
            return 'API base path must start with /';
          }
          return true;
        }
      }
    ]);

    return apiBase;
  }

  /**
   * Get API version
   */
  static async getApiVersion(): Promise<string> {
    const { apiVersion } = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiVersion',
        message: 'What is your default API version?',
        default: 'v1',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'API version is required';
          }
          if (!/^v\d+$/.test(input)) {
            return 'API version must be in format v1, v2, etc.';
          }
          return true;
        }
      }
    ]);

    return apiVersion;
  }

  /**
   * Get security features
   */
  static async getSecurityFeatures(): Promise<SecurityFeature[]> {
    const { securityFeatures } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'securityFeatures',
        message: 'Which optional security features would you like to enable?',
        choices: SECURITY_FEATURES.map(feature => ({
          name: `${feature.description} (${feature.name})`,
          value: feature.name,
          checked: feature.enabled
        }))
      }
    ]);

    return SECURITY_FEATURES.map(feature => ({
      ...feature,
      enabled: securityFeatures.includes(feature.name)
    }));
  }

  /**
   * Get compliance needs
   */
  static async getComplianceNeeds(): Promise<ComplianceNeed[]> {
    const { complianceNeeds } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'complianceNeeds',
        message: 'Which compliance requirements do you need?',
        choices: [
          ...COMPLIANCE_NEEDS.map(compliance => ({
            name: `${compliance.description} (${compliance.name})`,
            value: compliance.name,
            checked: compliance.enabled
          })),
          {
            name: 'None',
            value: 'none',
            checked: true
          }
        ]
      }
    ]);

    if (complianceNeeds.includes('none')) {
      return COMPLIANCE_NEEDS.map(compliance => ({
        ...compliance,
        enabled: false
      }));
    }

    return COMPLIANCE_NEEDS.map(compliance => ({
      ...compliance,
      enabled: complianceNeeds.includes(compliance.name)
    }));
  }

  /**
   * Get authentication providers
   */
  static async getAuthProviders(): Promise<AuthProvider[]> {
    const { authProviders } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'authProviders',
        message: 'Which authentication providers would you like to enable?',
        choices: AUTH_PROVIDERS.map(provider => ({
          name: `${provider.description} (${provider.name})`,
          value: provider.name,
          checked: provider.enabled
        }))
      }
    ]);

    return AUTH_PROVIDERS.map(provider => ({
      ...provider,
      enabled: authProviders.includes(provider.name)
    }));
  }

  /**
   * Get Sentry integration preference
   */
  static async getSentryPreference(): Promise<boolean> {
    const { enableSentry } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'enableSentry',
        message: 'Would you like to enable Sentry for error tracking?',
        default: false
      }
    ]);

    return enableSentry;
  }

  /**
   * Get GitHub Actions preference
   */
  static async getGitHubActionsPreference(): Promise<boolean> {
    const { enableGitHubActions } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'enableGitHubActions',
        message: 'Would you like to include GitHub Actions workflow?',
        default: false
      }
    ]);

    return enableGitHubActions;
  }

  /**
   * Get optional services
   */
  static async getOptionalServices(): Promise<OptionalService[]> {
    const { optionalServices } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'optionalServices',
        message: 'Which optional services would you like to include?',
        choices: OPTIONAL_SERVICES.map(service => ({
          name: `${service.description} (${service.name})`,
          value: service.name,
          checked: service.enabled
        }))
      }
    ]);

    return OPTIONAL_SERVICES.map(service => ({
      ...service,
      enabled: optionalServices.includes(service.name)
    }));
  }

  /**
   * Run all init prompts and return project config
   */
  static async runAllPrompts(): Promise<ProjectConfig> {
    console.log('\n🚀 Welcome to NestJS Generator!\n');
    console.log('Let\'s create your production-ready NestJS application.\n');

    const projectName = await this.getProjectName();
    const apiBase = await this.getApiBase();
    const apiVersion = await this.getApiVersion();
    const securityFeatures = await this.getSecurityFeatures();
    const complianceNeeds = await this.getComplianceNeeds();
    const authProviders = await this.getAuthProviders();
    const enableSentry = await this.getSentryPreference();
    const enableGitHubActions = await this.getGitHubActionsPreference();
    const optionalServices = await this.getOptionalServices();

    return {
      projectName,
      apiBase,
      apiVersion,
      securityFeatures,
      complianceNeeds,
      authProviders,
      enableSentry,
      enableGitHubActions,
      optionalServices
    };
  }
}
