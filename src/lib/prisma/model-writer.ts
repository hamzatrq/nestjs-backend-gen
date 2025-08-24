import { CrudEntity, EntityField, EntityRelationship } from '../types';

import { snakeCase } from 'change-case';
import path from 'path';
import fs from 'fs-extra';

export class PrismaModelWriter {
  static async generateModel(entity: CrudEntity): Promise<void> {
    const modelContent = this.generateModelContent(entity);
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    
    // Read existing schema
    let schemaContent = await fs.readFile(schemaPath, 'utf-8');
    
    // Add model to schema
    schemaContent += '\n' + modelContent;
    
    // Write back to schema
    await fs.writeFile(schemaPath, schemaContent);
  }

  private static generateModelContent(entity: CrudEntity): string {
    const entityName = entity.name;
    const tableName = snakeCase(entityName + 's');
    
    let content = `\nmodel ${entityName} {\n`;
    
    // Add fields
    for (const field of entity.fields) {
      content += `  ${field.name} ${this.mapFieldType(field)}`;
      
      if (field.optional) {
        content += '?';
      }
      
      if (field.unique) {
        content += ' @unique';
      }
      
      if (field.isId) {
        content += ' @id';
      }
      
      if (field.defaultValue) {
        content += ` @default(${field.defaultValue})`;
      }
      
      content += '\n';
    }
    
    // Add relationships
    for (const rel of entity.relationships) {
      content += `  ${rel.name} ${this.mapRelationshipType(rel)}\n`;
    }
    
    // Add table mapping
    content += `\n  @@map("${tableName}")\n}`;
    
    return content;
  }

  private static mapFieldType(field: EntityField): string {
    switch (field.type) {
      case 'string':
        return 'String';
      case 'text':
        return 'String @db.Text';
      case 'int':
        return 'Int';
      case 'bigint':
        return 'BigInt';
      case 'float':
        return 'Float';
      case 'decimal':
        return 'Decimal';
      case 'boolean':
        return 'Boolean';
      case 'date':
        return 'DateTime @db.Date';
      case 'datetime':
        return 'DateTime';
      case 'json':
        return 'Json';
      case 'uuid':
        return 'String @db.Uuid';
      default:
        return 'String';
    }
  }

  private static mapRelationshipType(rel: EntityRelationship): string {
    switch (rel.type) {
      case 'one-to-one':
        return rel.optional ? '?' : '';
      case 'one-to-many':
        return `@relation("${rel.name}To${rel.targetEntity}")`;
      case 'many-to-one':
        return rel.optional ? '?' : '';
      case 'many-to-many':
        return `@relation("${rel.name}To${rel.targetEntity}")`;
      default:
        return '';
    }
  }
}
