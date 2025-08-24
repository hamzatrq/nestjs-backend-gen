import { CrudEntity } from '../types';
import { kebabCase, pascalCase } from 'change-case';
import path from 'path';
import fs from 'fs-extra';

export class TestWriter {
  static async generateTests(entity: CrudEntity): Promise<void> {
    const entityName = entity.name;
    const entityNameKebab = kebabCase(entityName);

    
    // Create test directory
    const testPath = path.join(process.cwd(), 'test', entityNameKebab);
    await fs.ensureDir(testPath);
    
    // Generate unit tests
    await this.generateUnitTests(entity, testPath);
    
    // Generate integration tests
    await this.generateIntegrationTests(entity, testPath);
  }

  private static async generateUnitTests(entity: CrudEntity, testPath: string): Promise<void> {
    const entityName = entity.name;
    const entityNameKebab = kebabCase(entityName);
    const entityNamePascal = pascalCase(entityName);
    
    const content = `import { Test, TestingModule } from '@nestjs/testing';
import { ${entityNamePascal}Service } from '../../src/modules/${entityNameKebab}/${entityNameKebab}.service';
import { PrismaService } from '../../src/core/prisma/prisma.service';

describe('${entityNamePascal}Service', () => {
  let service: ${entityNamePascal}Service;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ${entityNamePascal}Service,
        {
          provide: PrismaService,
          useValue: {
            ${entityNameKebab}: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<${entityNamePascal}Service>(${entityNamePascal}Service);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ${entityNameKebab}', async () => {
      const createDto = { name: 'Test ${entityNamePascal}' };
      const expectedResult = { id: '1', ...createDto };

      jest.spyOn(prismaService.${entityNameKebab}, 'create').mockResolvedValue(expectedResult);

      const result = await service.create(createDto);
      expect(result).toEqual(expectedResult);
      expect(prismaService.${entityNameKebab}.create).toHaveBeenCalledWith({ data: createDto });
    });
  });

  describe('findAll', () => {
    it('should return paginated ${entityNameKebab}s', async () => {
      const query = { page: 1, limit: 10 };
      const data = [{ id: '1', name: 'Test' }];
      const total = 1;

      jest.spyOn(prismaService.${entityNameKebab}, 'findMany').mockResolvedValue(data);
      jest.spyOn(prismaService.${entityNameKebab}, 'count').mockResolvedValue(total);

      const result = await service.findAll(query);
      expect(result).toEqual({
        data,
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a ${entityNameKebab} by id', async () => {
      const id = '1';
      const expectedResult = { id, name: 'Test ${entityNamePascal}' };

      jest.spyOn(prismaService.${entityNameKebab}, 'findUnique').mockResolvedValue(expectedResult);

      const result = await service.findOne(id);
      expect(result).toEqual(expectedResult);
      expect(prismaService.${entityNameKebab}.findUnique).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw NotFoundException when ${entityNameKebab} not found', async () => {
      const id = '1';

      jest.spyOn(prismaService.${entityNameKebab}, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a ${entityNameKebab}', async () => {
      const id = '1';
      const updateDto = { name: 'Updated ${entityNamePascal}' };
      const expectedResult = { id, ...updateDto };

      jest.spyOn(prismaService.${entityNameKebab}, 'findUnique').mockResolvedValue({ id });
      jest.spyOn(prismaService.${entityNameKebab}, 'update').mockResolvedValue(expectedResult);

      const result = await service.update(id, updateDto);
      expect(result).toEqual(expectedResult);
      expect(prismaService.${entityNameKebab}.update).toHaveBeenCalledWith({
        where: { id },
        data: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete a ${entityNameKebab}', async () => {
      const id = '1';
      const expectedResult = { id, name: 'Test ${entityNamePascal}' };

      jest.spyOn(prismaService.${entityNameKebab}, 'findUnique').mockResolvedValue({ id });
      jest.spyOn(prismaService.${entityNameKebab}, 'delete').mockResolvedValue(expectedResult);

      const result = await service.remove(id);
      expect(result).toEqual(expectedResult);
      expect(prismaService.${entityNameKebab}.delete).toHaveBeenCalledWith({ where: { id } });
    });
  });
});
`;

    await fs.writeFile(path.join(testPath, `${entityNameKebab}.service.spec.ts`), content);
  }

  private static async generateIntegrationTests(entity: CrudEntity, testPath: string): Promise<void> {
    const entityName = entity.name;
    const entityNameKebab = kebabCase(entityName);
    const entityNamePascal = pascalCase(entityName);
    
    const content = `import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app/app.module';
import { PrismaService } from '../../src/core/prisma/prisma.service';

describe('${entityNamePascal}Controller (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterEach(async () => {
    // Clean up test data
    await prismaService.${entityNameKebab}.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/${entityNameKebab} (POST)', () => {
    it('should create a new ${entityNameKebab}', () => {
      const createDto = { name: 'Test ${entityNamePascal}' };

      return request(app.getHttpServer())
        .post('/${entityNameKebab}')
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(createDto.name);
        });
    });
  });

  describe('/${entityNameKebab} (GET)', () => {
    it('should return paginated ${entityNameKebab}s', async () => {
      // Create test data
      await prismaService.${entityNameKebab}.create({
        data: { name: 'Test ${entityNamePascal}' },
      });

      return request(app.getHttpServer())
        .get('/${entityNameKebab}')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('/${entityNameKebab}/:id (GET)', () => {
    it('should return a ${entityNameKebab} by id', async () => {
      const ${entityNameKebab} = await prismaService.${entityNameKebab}.create({
        data: { name: 'Test ${entityNamePascal}' },
      });

      return request(app.getHttpServer())
        .get(\`/${entityNameKebab}/\${${entityNameKebab}.id}\`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(${entityNameKebab}.id);
          expect(res.body.name).toBe(${entityNameKebab}.name);
        });
    });

    it('should return 404 for non-existent ${entityNameKebab}', () => {
      return request(app.getHttpServer())
        .get('/${entityNameKebab}/non-existent-id')
        .expect(404);
    });
  });

  describe('/${entityNameKebab}/:id (PATCH)', () => {
    it('should update a ${entityNameKebab}', async () => {
      const ${entityNameKebab} = await prismaService.${entityNameKebab}.create({
        data: { name: 'Test ${entityNamePascal}' },
      });

      const updateDto = { name: 'Updated ${entityNamePascal}' };

      return request(app.getHttpServer())
        .patch(\`/${entityNameKebab}/\${${entityNameKebab}.id}\`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(${entityNameKebab}.id);
          expect(res.body.name).toBe(updateDto.name);
        });
    });
  });

  describe('/${entityNameKebab}/:id (DELETE)', () => {
    it('should delete a ${entityNameKebab}', async () => {
      const ${entityNameKebab} = await prismaService.${entityNameKebab}.create({
        data: { name: 'Test ${entityNamePascal}' },
      });

      return request(app.getHttpServer())
        .delete(\`/${entityNameKebab}/\${${entityNameKebab}.id}\`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(${entityNameKebab}.id);
        });
    });
  });
});
`;

    await fs.writeFile(path.join(testPath, `${entityNameKebab}.e2e-spec.ts`), content);
  }
}
