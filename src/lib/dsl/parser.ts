import { CrudEntity, EntityField, EntityRelationship, FieldType, RelationshipType } from '../types';

export class DslParser {
  /**
   * Parse entity DSL string into CrudEntity object
   */
  static parseEntityDsl(dsl: string): CrudEntity {
    const lines = dsl.trim().split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('Empty DSL input');
    }

    // First line is entity name
    const entityName = lines[0]?.trim();
    if (!entityName) {
      throw new Error('Entity name is required');
    }

    const fields: EntityField[] = [];
    const relationships: EntityRelationship[] = [];

    // Parse remaining lines as fields
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      const field = this.parseFieldLine(line, entityName);
      if (field) {
        fields.push(field);
      }
    }

    // Extract relationships from fields
    const relationshipFields = fields.filter(f => f.name.includes('Id') && f.name !== 'id');
    for (const field of relationshipFields) {
      const relationship = this.createRelationshipFromField(field, entityName);
      if (relationship) {
        relationships.push(relationship);
      }
    }

    return {
      name: entityName,
      fields,
      relationships,
      softDelete: false, // Default, can be overridden
      auditing: true, // Default, can be overridden
      abacPolicies: this.generateDefaultAbacPolicies(entityName)
    };
  }

  /**
   * Parse a single field line
   */
  private static parseFieldLine(line: string, _entityName: string): EntityField {
    // Format: <name>:<type>[?][@unique][@id][@default(<value>)][@relation(<Entity>,<kind>)]
    const fieldMatch = line.match(/^(\w+):(\w+)(\?)?(.*)$/);
    

    
    if (!fieldMatch) {
      throw new Error(`Invalid field format: ${line}`);
    }

    const [, fieldName, fieldType, optional, modifiersString] = fieldMatch;
    
    if (!fieldName || !fieldType) {
      throw new Error(`Invalid field format: ${line}`);
    }
    
    // Parse modifiers
    const isOptional = !!optional;
    const modifiers = modifiersString ? modifiersString.split(/(?=@)/) : [];
    const isUnique = modifiers.some(m => m.includes('@unique'));
    const isId = modifiers.some(m => m.includes('@id'));
    const hasDefault = modifiers.find(m => m.includes('@default'));
    const hasRelation = modifiers.find(m => m.includes('@relation'));

    // Extract default value
    let defaultValue: string | undefined;
    if (hasDefault) {
      // Find the content between @default( and the last )
      const startIndex = hasDefault.indexOf('@default(') + 9; // length of '@default('
      const endIndex = hasDefault.lastIndexOf(')');
      if (startIndex > 8 && endIndex > startIndex) {
        defaultValue = hasDefault.substring(startIndex, endIndex);
      }
    }

    // Extract relation info
    let relationTarget: string | undefined;
    let relationType: RelationshipType | undefined;
    if (hasRelation) {
      const relationMatch = hasRelation.match(/@relation\(([^,]+),\s*([^)]+)\)/);
      if (relationMatch && relationMatch[1] && relationMatch[2]) {
        relationTarget = relationMatch[1].trim();
        relationType = relationMatch[2].trim() as RelationshipType;
      }
    }

    // Validate field type
    if (!this.isValidFieldType(fieldType)) {
      throw new Error(`Invalid field type: ${fieldType}`);
    }

    return {
      name: fieldName,
      type: fieldType as FieldType,
      optional: isOptional,
      unique: isUnique,
      isId,
      defaultValue,
      relationTarget,
      relationType
    };
  }

  /**
   * Create relationship from field
   */
  private static createRelationshipFromField(field: EntityField, _entityName: string): EntityRelationship | null {
    if (!field.relationTarget || !field.relationType) {
      return null;
    }

    return {
      name: field.name.replace('Id', ''),
      targetEntity: field.relationTarget,
      type: field.relationType,
      optional: field.optional
    };
  }

  /**
   * Generate default ABAC policies for entity
   */
  private static generateDefaultAbacPolicies(entityName: string) {
    const entityNameLower = entityName.toLowerCase();
    
    return [
      {
        action: 'create',
        resource: entityNameLower,
        conditions: [`user.roles.includes('admin') || user.roles.includes('${entityNameLower}_creator')`]
      },
      {
        action: 'read',
        resource: entityNameLower,
        conditions: [`user.roles.includes('admin') || user.roles.includes('${entityNameLower}_reader') || resource.createdBy === user.id`]
      },
      {
        action: 'update',
        resource: entityNameLower,
        conditions: [`user.roles.includes('admin') || user.roles.includes('${entityNameLower}_updater') || resource.createdBy === user.id`]
      },
      {
        action: 'delete',
        resource: entityNameLower,
        conditions: [`user.roles.includes('admin') || user.roles.includes('${entityNameLower}_deleter') || resource.createdBy === user.id`]
      },
      {
        action: 'list',
        resource: entityNameLower,
        conditions: [`user.roles.includes('admin') || user.roles.includes('${entityNameLower}_reader')`]
      }
    ];
  }

  /**
   * Validate field type
   */
  private static isValidFieldType(type: string): boolean {
    const validTypes: FieldType[] = [
      'string', 'text', 'int', 'bigint', 'float', 'decimal', 
      'boolean', 'date', 'datetime', 'json', 'uuid'
    ];
    return validTypes.includes(type as FieldType);
  }

  /**
   * Parse DSL from file
   */
  static async parseEntityDslFromFile(filePath: string): Promise<CrudEntity> {
    const fs = await import('fs-extra');
    const dsl = await fs.readFile(filePath, 'utf-8');
    return this.parseEntityDsl(dsl);
  }

  /**
   * Parse multiple entities from DSL
   */
  static parseEntitiesDsl(dsl: string): CrudEntity[] {
    const entities: CrudEntity[] = [];
    const entityBlocks = dsl.split(/\n\s*\n/).filter(block => block.trim());

    for (const block of entityBlocks) {
      const entity = this.parseEntityDsl(block);
      entities.push(entity);
    }

    return entities;
  }

  /**
   * Validate entity structure
   */
  static validateEntity(entity: CrudEntity): string[] {
    const errors: string[] = [];

    // Check for required fields
    const hasId = entity.fields.some(f => f.isId);
    if (!hasId) {
      errors.push('Entity must have an ID field');
    }

    // Check for duplicate field names
    const fieldNames = entity.fields.map(f => f.name);
    const duplicates = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate field names: ${duplicates.join(', ')}`);
    }

    // Check relationships
    for (const rel of entity.relationships) {
      if (!rel.targetEntity) {
        errors.push(`Relationship ${rel.name} has no target entity`);
      }
    }

    return errors;
  }
}
