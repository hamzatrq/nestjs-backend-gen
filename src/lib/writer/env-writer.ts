import { AuthProvider } from '../types';
import path from 'path';
import fs from 'fs-extra';

export class EnvWriter {
  static async updateAuthVariables(providers: AuthProvider[]): Promise<void> {
    const envPath = path.join(process.cwd(), '.env');
    const envExamplePath = path.join(process.cwd(), '.env.example');
    
    let envContent = '';
    let envExampleContent = '';
    
    // Read existing .env file if it exists
    if (await fs.pathExists(envPath)) {
      envContent = await fs.readFile(envPath, 'utf-8');
    }
    
    // Read existing .env.example file if it exists
    if (await fs.pathExists(envExamplePath)) {
      envExampleContent = await fs.readFile(envExamplePath, 'utf-8');
    }
    
    // Add auth variables
    const authVariables = this.generateAuthVariables(providers);
    
    // Update .env file
    if (!envContent.includes('JWT_SECRET')) {
      envContent += '\n# Authentication\n' + authVariables;
    }
    
    // Update .env.example file
    if (!envExampleContent.includes('JWT_SECRET')) {
      envExampleContent += '\n# Authentication\n' + authVariables;
    }
    
    // Write files
    await fs.writeFile(envPath, envContent);
    await fs.writeFile(envExamplePath, envExampleContent);
  }

  private static generateAuthVariables(providers: AuthProvider[]): string {
    let variables = '';
    
    // JWT is always included
    variables += 'JWT_SECRET=your-super-secret-jwt-key\n';
    variables += 'JWT_EXPIRES_IN=1d\n';
    
    // Add provider-specific variables
    for (const provider of providers) {
      switch (provider.name) {
        case 'google':
          variables += '\n# Google OAuth\n';
          variables += 'GOOGLE_CLIENT_ID=your-google-client-id\n';
          variables += 'GOOGLE_CLIENT_SECRET=your-google-client-secret\n';
          variables += 'GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback\n';
          break;
          
        case 'microsoft':
          variables += '\n# Microsoft OAuth\n';
          variables += 'MICROSOFT_CLIENT_ID=your-microsoft-client-id\n';
          variables += 'MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret\n';
          variables += 'MICROSOFT_CALLBACK_URL=http://localhost:3000/auth/microsoft/callback\n';
          break;
          
        case 'github':
          variables += '\n# GitHub OAuth\n';
          variables += 'GITHUB_CLIENT_ID=your-github-client-id\n';
          variables += 'GITHUB_CLIENT_SECRET=your-github-client-secret\n';
          variables += 'GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback\n';
          break;
          
        case 'api-key':
          variables += '\n# API Key Authentication\n';
          variables += 'API_KEY=your-api-key\n';
          break;
      }
    }
    
    return variables;
  }

  static async updateServiceVariables(services: string[]): Promise<void> {
    const envPath = path.join(process.cwd(), '.env');
    const envExamplePath = path.join(process.cwd(), '.env.example');
    
    let envContent = '';
    let envExampleContent = '';
    
    // Read existing files
    if (await fs.pathExists(envPath)) {
      envContent = await fs.readFile(envPath, 'utf-8');
    }
    
    if (await fs.pathExists(envExamplePath)) {
      envExampleContent = await fs.readFile(envExamplePath, 'utf-8');
    }
    
    // Add service variables
    const serviceVariables = this.generateServiceVariables(services);
    
    // Update files
    if (!envContent.includes('EMAIL_HOST')) {
      envContent += '\n# Services\n' + serviceVariables;
    }
    
    if (!envExampleContent.includes('EMAIL_HOST')) {
      envExampleContent += '\n# Services\n' + serviceVariables;
    }
    
    // Write files
    await fs.writeFile(envPath, envContent);
    await fs.writeFile(envExamplePath, envExampleContent);
  }

  private static generateServiceVariables(services: string[]): string {
    let variables = '';
    
    for (const service of services) {
      switch (service) {
        case 'email':
          variables += '\n# Email Service\n';
          variables += 'EMAIL_HOST=smtp.gmail.com\n';
          variables += 'EMAIL_PORT=587\n';
          variables += 'EMAIL_USER=your-email@gmail.com\n';
          variables += 'EMAIL_PASS=your-email-password\n';
          variables += 'EMAIL_FROM=noreply@yourapp.com\n';
          break;
          
        case 'cache':
          variables += '\n# Redis Cache\n';
          variables += 'REDIS_HOST=localhost\n';
          variables += 'REDIS_PORT=6379\n';
          variables += 'REDIS_PASSWORD=\n';
          break;
          
        case 'storage':
          variables += '\n# File Storage (AWS S3)\n';
          variables += 'AWS_ACCESS_KEY_ID=your-aws-access-key\n';
          variables += 'AWS_SECRET_ACCESS_KEY=your-aws-secret-key\n';
          variables += 'AWS_REGION=us-east-1\n';
          variables += 'AWS_S3_BUCKET=your-bucket-name\n';
          break;
          
        case 'notifications':
          variables += '\n# Push Notifications\n';
          variables += 'FIREBASE_PROJECT_ID=your-firebase-project-id\n';
          variables += 'FIREBASE_PRIVATE_KEY=your-firebase-private-key\n';
          variables += 'FIREBASE_CLIENT_EMAIL=your-firebase-client-email\n';
          break;
          
        case 'payments':
          variables += '\n# Payment Processing (Stripe)\n';
          variables += 'STRIPE_SECRET_KEY=your-stripe-secret-key\n';
          variables += 'STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key\n';
          variables += 'STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret\n';
          break;
          
        case 'search':
          variables += '\n# Search Service (Elasticsearch)\n';
          variables += 'ELASTICSEARCH_NODE=http://localhost:9200\n';
          variables += 'ELASTICSEARCH_USERNAME=elastic\n';
          variables += 'ELASTICSEARCH_PASSWORD=changeme\n';
          break;
      }
    }
    
    return variables;
  }
}
