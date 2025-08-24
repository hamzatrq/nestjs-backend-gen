import { DslParser } from './parser';
import { CrudEntity } from '../types';

describe('DslParser', () => {
  describe('parseEntityDsl', () => {
    it('should parse a simple entity', () => {
      const dsl = `User
id:uuid@id@default(cuid())
email:string@unique
name:string?
createdAt:datetime@default(now())
updatedAt:datetime@default(now())`;

      const result = DslParser.parseEntityDsl(dsl);

      expect(result.name).toBe('User');
      expect(result.fields).toHaveLength(5);
      expect(result.fields[0]).toEqual({
        name: 'id',
        type: 'uuid',
        optional: false,
        unique: false,
        isId: true,
        defaultValue: 'cuid()'
      });
      expect(result.fields[1]).toEqual({
        name: 'email',
        type: 'string',
        optional: false,
        unique: true,
        isId: false
      });
    });

    it('should parse entity with relationships', () => {
      const dsl = `Post
id:uuid@id@default(cuid())
title:string
content:text?
authorId:uuid@relation(User,many-to-one)
publishedAt:datetime?`;

      const result = DslParser.parseEntityDsl(dsl);

      expect(result.name).toBe('Post');
      expect(result.fields).toHaveLength(5);
      expect(result.relationships).toHaveLength(1);
      expect(result.relationships[0]).toEqual({
        name: 'author',
        targetEntity: 'User',
        type: 'many-to-one',
        optional: false
      });
    });

    it('should throw error for empty DSL', () => {
      expect(() => DslParser.parseEntityDsl('')).toThrow('Empty DSL input');
    });

    it('should throw error for invalid field type', () => {
      const dsl = `User
id:invalid@id`;

      expect(() => DslParser.parseEntityDsl(dsl)).toThrow('Invalid field type: invalid');
    });

    it('should throw error for invalid field format', () => {
      const dsl = `User
invalid-field`;

      expect(() => DslParser.parseEntityDsl(dsl)).toThrow('Invalid field format: invalid-field');
    });
  });

  describe('validateEntity', () => {
    it('should validate a correct entity', () => {
      const entity: CrudEntity = {
        name: 'User',
        fields: [
          {
            name: 'id',
            type: 'uuid',
            optional: false,
            unique: false,
            isId: true
          }
        ],
        relationships: [],
        softDelete: false,
        auditing: true,
        abacPolicies: []
      };

      const errors = DslParser.validateEntity(entity);
      expect(errors).toHaveLength(0);
    });

    it('should return error for entity without ID field', () => {
      const entity: CrudEntity = {
        name: 'User',
        fields: [
          {
            name: 'email',
            type: 'string',
            optional: false,
            unique: true,
            isId: false
          }
        ],
        relationships: [],
        softDelete: false,
        auditing: true,
        abacPolicies: []
      };

      const errors = DslParser.validateEntity(entity);
      expect(errors).toContain('Entity must have an ID field');
    });

    it('should return error for duplicate field names', () => {
      const entity: CrudEntity = {
        name: 'User',
        fields: [
          {
            name: 'email',
            type: 'string',
            optional: false,
            unique: true,
            isId: true
          },
          {
            name: 'email',
            type: 'string',
            optional: false,
            unique: false,
            isId: false
          }
        ],
        relationships: [],
        softDelete: false,
        auditing: true,
        abacPolicies: []
      };

      const errors = DslParser.validateEntity(entity);
      expect(errors).toContain('Duplicate field names: email');
    });
  });

  describe('parseEntitiesDsl', () => {
    it('should parse multiple entities', () => {
      const dsl = `User
id:uuid@id@default(cuid())
email:string@unique

Post
id:uuid@id@default(cuid())
title:string
authorId:uuid@relation(User,many-to-one)`;

      const results = DslParser.parseEntitiesDsl(dsl);

      expect(results).toHaveLength(2);
      expect(results[0]?.name).toBe('User');
      expect(results[1]?.name).toBe('Post');
    });
  });
});
