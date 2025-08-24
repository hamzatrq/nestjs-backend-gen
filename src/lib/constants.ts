import { SecurityFeature, ComplianceNeed, AuthProvider, OptionalService } from './types';

export const SECURITY_FEATURES: SecurityFeature[] = [
  {
    name: 'input-sanitization',
    enabled: false,
    description: 'Input sanitization for XSS protection'
  },
  {
    name: 'data-encryption',
    enabled: false,
    description: 'Data encryption at rest for selected fields'
  },
  {
    name: 'extra-validation',
    enabled: false,
    description: 'Extra request validation schemas beyond DTOs'
  }
];

export const COMPLIANCE_NEEDS: ComplianceNeed[] = [
  {
    name: 'gdpr',
    enabled: false,
    description: 'General Data Protection Regulation compliance'
  },
  {
    name: 'hipaa',
    enabled: false,
    description: 'Health Insurance Portability and Accountability Act compliance'
  },
  {
    name: 'pci-dss',
    enabled: false,
    description: 'Payment Card Industry Data Security Standard compliance'
  }
];

export const AUTH_PROVIDERS: AuthProvider[] = [
  {
    name: 'email-password',
    enabled: true,
    description: 'Email + password authentication with JWT',
    configKeys: ['JWT_SECRET', 'JWT_EXPIRES_IN', 'REFRESH_JWT_SECRET', 'REFRESH_JWT_EXPIRES_IN']
  },
  {
    name: 'google',
    enabled: false,
    description: 'Google OAuth2 authentication',
    configKeys: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL']
  },
  {
    name: 'microsoft',
    enabled: false,
    description: 'Microsoft OAuth2 authentication',
    configKeys: ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET', 'MICROSOFT_CALLBACK_URL']
  },
  {
    name: 'github',
    enabled: false,
    description: 'GitHub OAuth2 authentication',
    configKeys: ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'GITHUB_CALLBACK_URL']
  },
  {
    name: 'api-keys',
    enabled: false,
    description: 'API key authentication',
    configKeys: ['API_KEY_HEADER', 'API_KEY_SECRET']
  },
  {
    name: 'openid-connect',
    enabled: false,
    description: 'Generic OpenID Connect authentication',
    configKeys: ['OIDC_ISSUER', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET', 'OIDC_CALLBACK_URL']
  }
];

export const OPTIONAL_SERVICES: OptionalService[] = [
  {
    name: 'email',
    enabled: false,
    description: 'Email service (SMTP + provider abstraction)',
    configKeys: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM']
  },
  {
    name: 'file-storage',
    enabled: false,
    description: 'File storage (local + S3 adapter)',
    configKeys: ['S3_BUCKET', 'S3_REGION', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY']
  },
  {
    name: 'cache',
    enabled: false,
    description: 'Cache service (Redis)',
    configKeys: ['REDIS_URL']
  },
  {
    name: 'notifications',
    enabled: false,
    description: 'Notifications (web push)',
    configKeys: ['VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY']
  },
  {
    name: 'task-scheduling',
    enabled: false,
    description: 'Task scheduling (BullMQ + Redis)',
    configKeys: ['REDIS_URL', 'BULLMQ_PREFIX']
  },
  {
    name: 'payments',
    enabled: false,
    description: 'Payments (Stripe)',
    configKeys: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']
  },
  {
    name: 'search',
    enabled: false,
    description: 'Search (Meilisearch)',
    configKeys: ['MEILISEARCH_URL', 'MEILISEARCH_MASTER_KEY']
  }
];

export const FIELD_TYPES = [
  'string',
  'text',
  'int',
  'bigint',
  'float',
  'decimal',
  'boolean',
  'date',
  'datetime',
  'json',
  'uuid'
] as const;

export const RELATIONSHIP_TYPES = [
  'one-to-one',
  'one-to-many',
  'many-to-one',
  'many-to-many'
] as const;

export const ABAC_ACTIONS = [
  'create',
  'read',
  'update',
  'delete',
  'list'
] as const;
