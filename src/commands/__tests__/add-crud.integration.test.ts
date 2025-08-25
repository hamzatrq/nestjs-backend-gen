import AddCrud from '../add-crud';
import * as fs from 'fs-extra';
import * as path from 'path';
import { TemplateCopier } from '../../lib/writer/copier';
import { DslParser } from '../../lib/dsl/parser';
// import { CrudGenerator } from '../../lib/crud/generator';

// Mock dependencies
jest.mock('fs-extra');
jest.mock('../../lib/writer/copier');
jest.mock('../../lib/dsl/parser');
// jest.mock('../../lib/crud/generator');
jest.mock('inquirer');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockTemplateCopier = TemplateCopier as jest.MockedClass<typeof TemplateCopier>;
const mockDslParser = DslParser as jest.MockedClass<typeof DslParser>;
// const mockCrudGenerator = CrudGenerator as jest.MockedClass<typeof CrudGenerator>;

describe('AddCrud Command Integration Tests', () => {
  let addCrudCommand: AddCrud;
  let tempDir: string;

  beforeEach(() => {
    tempDir = path.join(process.cwd(), 'temp-test-project');
    addCrudCommand = new AddCrud([], {} as any);
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock fs methods
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('{}');
    mockFs.writeFileSync.mockImplementation(() => {});
    mockFs.appendFileSync.mockImplementation(() => {});
    
    // Mock TemplateCopier methods
    (mockTemplateCopier.copyTemplate as jest.Mock).mockResolvedValue(undefined);
    (mockTemplateCopier.createFile as jest.Mock).mockResolvedValue(undefined);
    (mockTemplateCopier.appendToFile as jest.Mock).mockResolvedValue(undefined);
    
    // Mock DslParser methods
    (mockDslParser.parseEntityDsl as jest.Mock).mockReturnValue({
      name: 'User',
      fields: [
        {
          name: 'id',
          type: 'uuid',
          optional: false,
          unique: false,
          isId: true,
          defaultValue: 'cuid()'
        },
        {
          name: 'email',
          type: 'string',
          optional: false,
          unique: true,
          isId: false
        },
        {
          name: 'name',
          type: 'string',
          optional: true,
          unique: false,
          isId: false
        }
      ],
      relationships: [],
      softDelete: false,
      auditing: true,
      abacPolicies: []
    });
    
    // Mock CrudGenerator methods
    // (mockCrudGenerator.generateCrud as jest.Mock).mockResolvedValue();
  });

  afterEach(async () => {
    // Clean up temp directory if it exists
    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
    }
  });

  describe('DSL Parsing and Validation', () => {
    it('should parse valid DSL and generate CRUD', async () => {
      const dsl = `User
id:uuid@id@default(cuid())
email:string@unique
name:string?
createdAt:datetime@default(now())
updatedAt:datetime@default(now())`;

      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({
        dsl: dsl,
        generateTests: true,
        generateDocs: true
      });

      await addCrudCommand.run();

      // Verify DSL was parsed
      expect(mockDslParser.parseEntityDsl).toHaveBeenCalledWith(dsl);
      
      // Verify CRUD was generated
      expect(mockDslParser.parseEntityDsl).toHaveBeenCalledWith(dsl);
    });

    it('should handle invalid DSL gracefully', async () => {
      const invalidDsl = `User
invalid-field-format`;

      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({
        dsl: invalidDsl,
        generateTests: true,
        generateDocs: true
      });

      // Mock parser to throw error
      (mockDslParser.parseEntityDsl as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid field format: invalid-field-format');
      });

      await expect(addCrudCommand.run()).rejects.toThrow('Invalid field format: invalid-field-format');
    });

    it('should validate entity structure', async () => {
      const dsl = `User
email:string@unique
name:string?`;

      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({
        dsl: dsl,
        generateTests: true,
        generateDocs: true
      });

      // Mock parser to return entity without ID field
      (mockDslParser.parseEntityDsl as jest.Mock).mockReturnValue({
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
      });

      // Mock validator to return errors
      (mockDslParser.validateEntity as jest.Mock).mockReturnValue(['Entity must have an ID field']);

      await expect(addCrudCommand.run()).rejects.toThrow('Entity validation failed');
    });
  });

  describe('CRUD Generation', () => {
    it('should generate complete CRUD module with all files', async () => {
      const dsl = `User
id:uuid@id@default(cuid())
email:string@unique
name:string?`;

      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({
        dsl: dsl,
        generateTests: true,
        generateDocs: true
      });

      await addCrudCommand.run();

      // Verify all CRUD files were generated
      expect(mockDslParser.parseEntityDsl).toHaveBeenCalledWith(dsl);
    });

    it('should generate CRUD with relationships', async () => {
      const dsl = `Post
id:uuid@id@default(cuid())
title:string
content:text?
authorId:uuid@relation(User,many-to-one)
publishedAt:datetime?`;

      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({
        dsl: dsl,
        generateTests: true,
        generateDocs: true
      });

      // Mock parser to return entity with relationships
      (mockDslParser.parseEntityDsl as jest.Mock).mockReturnValue({
        name: 'Post',
        fields: [
          {
            name: 'id',
            type: 'uuid',
            optional: false,
            unique: false,
            isId: true,
            defaultValue: 'cuid()'
          },
          {
            name: 'title',
            type: 'string',
            optional: false,
            unique: false,
            isId: false
          },
          {
            name: 'content',
            type: 'text',
            optional: true,
            unique: false,
            isId: false
          },
          {
            name: 'authorId',
            type: 'uuid',
            optional: false,
            unique: false,
            isId: false
          }
        ],
        relationships: [
          {
            name: 'author',
            targetEntity: 'User',
            type: 'many-to-one',
            optional: false
          }
        ],
        softDelete: false,
        auditing: true,
        abacPolicies: []
      });

      await addCrudCommand.run();

      // Verify CRUD was generated with relationships
      expect(mockDslParser.parseEntityDsl).toHaveBeenCalledWith(dsl);
    });

    it('should generate CRUD with soft delete', async () => {
      const dsl = `User
id:uuid@id@default(cuid())
email:string@unique
name:string?
deletedAt:datetime?`;

      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({
        dsl: dsl,
        generateTests: true,
        generateDocs: true
      });

      // Mock parser to return entity with soft delete
      (mockDslParser.parseEntityDsl as jest.Mock).mockReturnValue({
        name: 'User',
        fields: [
          {
            name: 'id',
            type: 'uuid',
            optional: false,
            unique: false,
            isId: true,
            defaultValue: 'cuid()'
          },
          {
            name: 'email',
            type: 'string',
            optional: false,
            unique: true,
            isId: false
          },
          {
            name: 'name',
            type: 'string',
            optional: true,
            unique: false,
            isId: false
          },
          {
            name: 'deletedAt',
            type: 'datetime',
            optional: true,
            unique: false,
            isId: false
          }
        ],
        relationships: [],
        softDelete: true,
        auditing: true,
        abacPolicies: []
      });

      await addCrudCommand.run();

      // Verify CRUD was generated with soft delete
      expect(mockDslParser.parseEntityDsl).toHaveBeenCalledWith(dsl);
    });
  });

  describe('Test Generation', () => {
    it('should generate unit tests when requested', async () => {
      const dsl = `User
id:uuid@id@default(cuid())
email:string@unique
name:string?`;

      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({
        dsl: dsl,
        generateTests: true,
        generateDocs: false
      });

      await addCrudCommand.run();

      // Verify tests were generated
      expect(mockDslParser.parseEntityDsl).toHaveBeenCalledWith(dsl);
    });

    it('should generate integration tests when requested', async () => {
      const dsl = `User
id:uuid@id@default(cuid())
email:string@unique
name:string?`;

      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({
        dsl: dsl,
        generateTests: true,
        generateDocs: false,
        testTypes: ['unit', 'integration']
      });

      await addCrudCommand.run();

      // Verify integration tests were generated
      expect(mockDslParser.parseEntityDsl).toHaveBeenCalledWith(dsl);
    });
  });

  describe('Documentation Generation', () => {
    it('should generate Swagger documentation when requested', async () => {
      const dsl = `User
id:uuid@id@default(cuid())
email:string@unique
name:string?`;

      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({
        dsl: dsl,
        generateTests: false,
        generateDocs: true
      });

      await addCrudCommand.run();

      // Verify docs were generated
      expect(mockDslParser.parseEntityDsl).toHaveBeenCalledWith(dsl);
    });

    it('should generate TSDoc comments when requested', async () => {
      const dsl = `User
id:uuid@id@default(cuid())
email:string@unique
name:string?`;

      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({
        dsl: dsl,
        generateTests: false,
        generateDocs: true,
        docTypes: ['swagger', 'tsdoc']
      });

      await addCrudCommand.run();

      // Verify TSDoc was generated
      expect(mockDslParser.parseEntityDsl).toHaveBeenCalledWith(dsl);
    });
  });

  describe('Error Handling', () => {
    it('should handle file system errors gracefully', async () => {
      const dsl = `User
id:uuid@id@default(cuid())
email:string@unique`;

      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({
        dsl: dsl,
        generateTests: true,
        generateDocs: true
      });

      // Mock file system error
      mockFs.existsSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      await expect(addCrudCommand.run()).rejects.toThrow('Permission denied');
    });

    it('should handle CRUD generation errors gracefully', async () => {
      const dsl = `User
id:uuid@id@default(cuid())
email:string@unique`;

      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({
        dsl: dsl,
        generateTests: true,
        generateDocs: true
      });

      // Mock CRUD generation error
      (mockDslParser.parseEntityDsl as jest.Mock).mockRejectedValue(new Error('Template not found'));

      await expect(addCrudCommand.run()).rejects.toThrow('Template not found');
    });
  });

  describe('Project Structure Validation', () => {
    it('should validate that project is a NestJS project', async () => {
      const dsl = `User
id:uuid@id@default(cuid())
email:string@unique`;

      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({
        dsl: dsl,
        generateTests: true,
        generateDocs: true
      });

      // Mock that package.json doesn't exist
      mockFs.existsSync.mockReturnValue(false);

      await expect(addCrudCommand.run()).rejects.toThrow('Not a valid NestJS project');
    });

    it('should validate that package.json contains NestJS dependencies', async () => {
      const dsl = `User
id:uuid@id@default(cuid())
email:string@unique`;

      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({
        dsl: dsl,
        generateTests: true,
        generateDocs: true
      });

      // Mock package.json without NestJS dependencies
      mockFs.readFileSync.mockReturnValue('{"dependencies": {}}');

      await expect(addCrudCommand.run()).rejects.toThrow('Not a valid NestJS project');
    });
  });

  describe('Multiple Entity Generation', () => {
    it('should generate multiple entities from DSL', async () => {
      const dsl = `User
id:uuid@id@default(cuid())
email:string@unique

Post
id:uuid@id@default(cuid())
title:string
authorId:uuid@relation(User,many-to-one)`;

      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({
        dsl: dsl,
        generateTests: true,
        generateDocs: true
      });

      // Mock parser to return multiple entities
      (mockDslParser.parseEntitiesDsl as jest.Mock).mockReturnValue([
        {
          name: 'User',
          fields: [
            {
              name: 'id',
              type: 'uuid',
              optional: false,
              unique: false,
              isId: true,
              defaultValue: 'cuid()'
            },
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
        },
        {
          name: 'Post',
          fields: [
            {
              name: 'id',
              type: 'uuid',
              optional: false,
              unique: false,
              isId: true,
              defaultValue: 'cuid()'
            },
            {
              name: 'title',
              type: 'string',
              optional: false,
              unique: false,
              isId: false
            },
            {
              name: 'authorId',
              type: 'uuid',
              optional: false,
              unique: false,
              isId: false
            }
          ],
          relationships: [
            {
              name: 'author',
              targetEntity: 'User',
              type: 'many-to-one',
              optional: false
            }
          ],
          softDelete: false,
          auditing: true,
          abacPolicies: []
        }
      ]);

      await addCrudCommand.run();

      // Verify multiple entities were generated
      expect(mockDslParser.parseEntitiesDsl).toHaveBeenCalledWith(dsl);
    });
  });
});
