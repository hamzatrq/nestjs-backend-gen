import { CrudEntity } from '../types';

import { kebabCase, pascalCase } from 'change-case';
import path from 'path';
import fs from 'fs-extra';

export class NestJSFileWriter {
  static async generateFiles(entity: CrudEntity): Promise<void> {
    const modulePath = path.join(process.cwd(), 'src', 'modules', kebabCase(entity.name));
    
    // Create module directory
    await fs.ensureDir(modulePath);
    
    // Generate module file
    await this.generateModule(entity, modulePath);
    
    // Generate controller
    await this.generateController(entity, modulePath);
    
    // Generate service
    await this.generateService(entity, modulePath);
    
    // Generate DTOs
    await this.generateDTOs(entity, modulePath);
    
    // Generate entity
    await this.generateEntity(entity, modulePath);
  }

  private static async generateModule(entity: CrudEntity, modulePath: string): Promise<void> {
    const entityName = entity.name;
    const entityNameKebab = kebabCase(entityName);
    const entityNamePascal = pascalCase(entityName);
    
    const content = `import { Module } from '@nestjs/common';
import { ${entityNamePascal}Controller } from './${entityNameKebab}.controller';
import { ${entityNamePascal}Service } from './${entityNameKebab}.service';

@Module({
  controllers: [${entityNamePascal}Controller],
  providers: [${entityNamePascal}Service],
  exports: [${entityNamePascal}Service],
})
export class ${entityNamePascal}Module {}
`;

    await fs.writeFile(path.join(modulePath, `${entityNameKebab}.module.ts`), content);
  }

  private static async generateController(entity: CrudEntity, modulePath: string): Promise<void> {
    const entityName = entity.name;
    const entityNameKebab = kebabCase(entityName);
    const entityNamePascal = pascalCase(entityName);
    const entityNamePlural = entityNamePascal + 's';
    
    const content = `import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ${entityNamePascal}Service } from './${entityNameKebab}.service';
import { Create${entityNamePascal}Dto } from './dto/create-${entityNameKebab}.dto';
import { Update${entityNamePascal}Dto } from './dto/update-${entityNameKebab}.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('${entityNamePlural}')
@Controller('${entityNameKebab}')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ${entityNamePascal}Controller {
  constructor(private readonly ${entityNameKebab}Service: ${entityNamePascal}Service) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ${entityNameKebab}' })
  @ApiResponse({ status: 201, description: '${entityNamePascal} created successfully' })
  create(@Body() create${entityNamePascal}Dto: Create${entityNamePascal}Dto) {
    return this.${entityNameKebab}Service.create(create${entityNamePascal}Dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ${entityNameKebab}s' })
  @ApiResponse({ status: 200, description: 'List of ${entityNameKebab}s' })
  findAll(@Query() query: any) {
    return this.${entityNameKebab}Service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ${entityNameKebab} by id' })
  @ApiResponse({ status: 200, description: '${entityNamePascal} found' })
  @ApiResponse({ status: 404, description: '${entityNamePascal} not found' })
  findOne(@Param('id') id: string) {
    return this.${entityNameKebab}Service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a ${entityNameKebab}' })
  @ApiResponse({ status: 200, description: '${entityNamePascal} updated successfully' })
  @ApiResponse({ status: 404, description: '${entityNamePascal} not found' })
  update(@Param('id') id: string, @Body() update${entityNamePascal}Dto: Update${entityNamePascal}Dto) {
    return this.${entityNameKebab}Service.update(id, update${entityNamePascal}Dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a ${entityNameKebab}' })
  @ApiResponse({ status: 200, description: '${entityNamePascal} deleted successfully' })
  @ApiResponse({ status: 404, description: '${entityNamePascal} not found' })
  remove(@Param('id') id: string) {
    return this.${entityNameKebab}Service.remove(id);
  }
}
`;

    await fs.writeFile(path.join(modulePath, `${entityNameKebab}.controller.ts`), content);
  }

  private static async generateService(entity: CrudEntity, modulePath: string): Promise<void> {
    const entityName = entity.name;
    const entityNameKebab = kebabCase(entityName);
    const entityNamePascal = pascalCase(entityName);
    
    const content = `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Create${entityNamePascal}Dto } from './dto/create-${entityNameKebab}.dto';
import { Update${entityNamePascal}Dto } from './dto/update-${entityNameKebab}.dto';

@Injectable()
export class ${entityNamePascal}Service {
  constructor(private readonly prisma: PrismaService) {}

  async create(create${entityNamePascal}Dto: Create${entityNamePascal}Dto) {
    return this.prisma.${entityNameKebab}.create({
      data: create${entityNamePascal}Dto,
    });
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, ...where } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.${entityNameKebab}.findMany({
        where,
        skip,
        take: limit,
      }),
      this.prisma.${entityNameKebab}.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const ${entityNameKebab} = await this.prisma.${entityNameKebab}.findUnique({
      where: { id },
    });

    if (!${entityNameKebab}) {
      throw new NotFoundException(\`${entityNamePascal} with ID \${id} not found\`);
    }

    return ${entityNameKebab};
  }

  async update(id: string, update${entityNamePascal}Dto: Update${entityNamePascal}Dto) {
    await this.findOne(id);

    return this.prisma.${entityNameKebab}.update({
      where: { id },
      data: update${entityNamePascal}Dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.${entityNameKebab}.delete({
      where: { id },
    });
  }
}
`;

    await fs.writeFile(path.join(modulePath, `${entityNameKebab}.service.ts`), content);
  }

  private static async generateDTOs(entity: CrudEntity, modulePath: string): Promise<void> {
    const dtoPath = path.join(modulePath, 'dto');
    await fs.ensureDir(dtoPath);
    
    await this.generateCreateDTO(entity, dtoPath);
    await this.generateUpdateDTO(entity, dtoPath);
  }

  private static async generateCreateDTO(entity: CrudEntity, dtoPath: string): Promise<void> {
    const entityName = entity.name;
    const entityNameKebab = kebabCase(entityName);
    const entityNamePascal = pascalCase(entityName);
    
    let content = `import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString, IsUUID } from 'class-validator';

export class Create${entityNamePascal}Dto {
`;

    for (const field of entity.fields) {
      if (field.isId) continue; // Skip ID fields in create DTO
      
      const decorators = this.generateFieldDecorators(field);
      content += `  ${decorators}
  ${field.name}${field.optional ? '?' : ''}: ${this.mapFieldTypeToTS(field)};

`;
    }

    content += '}\n';
    
    await fs.writeFile(path.join(dtoPath, `create-${entityNameKebab}.dto.ts`), content);
  }

  private static async generateUpdateDTO(entity: CrudEntity, dtoPath: string): Promise<void> {
    const entityName = entity.name;
    const entityNameKebab = kebabCase(entityName);
    const entityNamePascal = pascalCase(entityName);
    
    let content = `import { PartialType } from '@nestjs/swagger';
import { Create${entityNamePascal}Dto } from './create-${entityNameKebab}.dto';

export class Update${entityNamePascal}Dto extends PartialType(Create${entityNamePascal}Dto) {}
`;

    await fs.writeFile(path.join(dtoPath, `update-${entityNameKebab}.dto.ts`), content);
  }

  private static async generateEntity(entity: CrudEntity, modulePath: string): Promise<void> {
    const entityName = entity.name;
    const entityNameKebab = kebabCase(entityName);
    const entityNamePascal = pascalCase(entityName);
    
    let content = `import { ApiProperty } from '@nestjs/swagger';

export class ${entityNamePascal} {
`;

    for (const field of entity.fields) {
      content += `  @ApiProperty({ description: '${field.name}' })
  ${field.name}: ${this.mapFieldTypeToTS(field)};

`;
    }

    content += '}\n';
    
    await fs.writeFile(path.join(modulePath, `entities/${entityNameKebab}.entity.ts`), content);
  }

  private static generateFieldDecorators(field: any): string {
    const decorators = [];
    
    switch (field.type) {
      case 'string':
      case 'text':
        decorators.push('@IsString()');
        break;
      case 'int':
      case 'bigint':
      case 'float':
      case 'decimal':
        decorators.push('@IsNumber()');
        break;
      case 'boolean':
        decorators.push('@IsBoolean()');
        break;
      case 'date':
      case 'datetime':
        decorators.push('@IsDateString()');
        break;
      case 'uuid':
        decorators.push('@IsUUID()');
        break;
    }
    
    if (field.optional) {
      decorators.push('@IsOptional()');
    }
    
    decorators.push(`@ApiProperty({ description: '${field.name}'${field.optional ? ', required: false' : ''} })`);
    
    return decorators.join('\n  ');
  }

  private static mapFieldTypeToTS(field: any): string {
    switch (field.type) {
      case 'string':
      case 'text':
      case 'uuid':
        return 'string';
      case 'int':
      case 'bigint':
      case 'float':
      case 'decimal':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'date':
      case 'datetime':
        return 'Date';
      case 'json':
        return 'any';
      default:
        return 'string';
    }
  }
}
