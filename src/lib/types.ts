export interface ProjectConfig {
  projectName: string;
  apiBase: string;
  apiVersion: string;
  securityFeatures: SecurityFeature[];
  complianceNeeds: ComplianceNeed[];
  authProviders: AuthProvider[];
  enableSentry: boolean;
  enableGitHubActions: boolean;
  optionalServices: OptionalService[];
}

export interface SecurityFeature {
  name: string;
  enabled: boolean;
  description: string;
}

export interface ComplianceNeed {
  name: string;
  enabled: boolean;
  description: string;
}

export interface AuthProvider {
  name: string;
  enabled: boolean;
  description: string;
  configKeys?: string[];
}

export interface OptionalService {
  name: string;
  enabled: boolean;
  description: string;
  configKeys?: string[];
}

export interface CrudEntity {
  name: string;
  fields: EntityField[];
  relationships: EntityRelationship[];
  softDelete: boolean;
  auditing: boolean;
  abacPolicies: AbacPolicy[];
}

export interface EntityField {
  name: string;
  type: FieldType;
  optional: boolean;
  unique: boolean;
  isId: boolean;
  defaultValue?: string | undefined;
  relationTarget?: string | undefined;
  relationType?: RelationshipType | undefined;
}

export interface EntityRelationship {
  name: string;
  targetEntity: string;
  type: RelationshipType;
  optional: boolean;
}

export interface AbacPolicy {
  action: string;
  resource: string;
  conditions: string[];
}

export type FieldType = 
  | 'string' 
  | 'text' 
  | 'int' 
  | 'bigint' 
  | 'float' 
  | 'decimal' 
  | 'boolean' 
  | 'date' 
  | 'datetime' 
  | 'json' 
  | 'uuid';

export type RelationshipType = 
  | 'one-to-one' 
  | 'one-to-many' 
  | 'many-to-one' 
  | 'many-to-many';

export interface TemplateContext {
  projectName: string;
  projectNameKebab: string;
  projectNamePascal: string;
  projectNameCamel: string;
  apiBase: string;
  apiVersion: string;
  securityFeatures: SecurityFeature[];
  complianceNeeds: ComplianceNeed[];
  authProviders: AuthProvider[];
  enableSentry: boolean;
  enableGitHubActions: boolean;
  optionalServices: OptionalService[];
  [key: string]: any;
}

export interface GeneratorOptions {
  targetPath: string;
  templatePath: string;
  context: TemplateContext;
  overwrite?: boolean;
}
