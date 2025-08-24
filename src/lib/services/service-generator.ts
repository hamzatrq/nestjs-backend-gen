import { kebabCase, pascalCase } from 'change-case';
import path from 'path';
import fs from 'fs-extra';

export class ServiceGenerator {
  static async generateModules(services: string[]): Promise<void> {
    for (const service of services) {
      await this.generateServiceModule(service);
    }
  }

  private static async generateServiceModule(serviceName: string): Promise<void> {
    const serviceNameKebab = kebabCase(serviceName);
    const serviceNamePascal = pascalCase(serviceName);
    
    // Create service directory
    const servicePath = path.join(process.cwd(), 'src', 'modules', serviceNameKebab);
    await fs.ensureDir(servicePath);
    
    // Generate service files
    await this.generateServiceFiles(serviceName, servicePath);
    
    // Update app module
    await this.updateAppModule(serviceName, serviceNamePascal);
  }

  private static async generateServiceFiles(serviceName: string, servicePath: string): Promise<void> {
    const serviceNameKebab = kebabCase(serviceName);
    const serviceNamePascal = pascalCase(serviceName);
    
    switch (serviceName) {
      case 'email':
        await this.generateEmailService(servicePath, serviceNameKebab, serviceNamePascal);
        break;
      case 'cache':
        await this.generateCacheService(servicePath, serviceNameKebab, serviceNamePascal);
        break;
      case 'storage':
        await this.generateStorageService(servicePath, serviceNameKebab, serviceNamePascal);
        break;
      case 'notifications':
        await this.generateNotificationsService(servicePath, serviceNameKebab, serviceNamePascal);
        break;
      case 'payments':
        await this.generatePaymentsService(servicePath, serviceNameKebab, serviceNamePascal);
        break;
      case 'search':
        await this.generateSearchService(servicePath, serviceNameKebab, serviceNamePascal);
        break;
      default:
        await this.generateGenericService(servicePath, serviceNameKebab, serviceNamePascal);
    }
  }

  private static async generateEmailService(servicePath: string, serviceNameKebab: string, serviceNamePascal: string): Promise<void> {
    // Generate module
    const moduleContent = `import { Module } from '@nestjs/common';
import { ${serviceNamePascal}Service } from './${serviceNameKebab}.service';
import { ${serviceNamePascal}Controller } from './${serviceNameKebab}.controller';

@Module({
  controllers: [${serviceNamePascal}Controller],
  providers: [${serviceNamePascal}Service],
  exports: [${serviceNamePascal}Service],
})
export class ${serviceNamePascal}Module {}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.module.ts`), moduleContent);

    // Generate service
    const serviceContent = `import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ${serviceNamePascal}Service {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransporter({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }

  async sendEmail(to: string, subject: string, content: string, html?: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to,
      subject,
      text: content,
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendTemplateEmail(to: string, template: string, data: any): Promise<void> {
    // Implement template-based email sending
    const subject = data.subject || 'Notification';
    const content = this.renderTemplate(template, data);
    
    await this.sendEmail(to, subject, content);
  }

  private renderTemplate(template: string, data: any): string {
    // Simple template rendering - in production, use a proper templating engine
    return template.replace(/\\{\\{([^}]+)\\}\\}/g, (match, key) => {
      return data[key.trim()] || match;
    });
  }
}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.service.ts`), serviceContent);

    // Generate controller
    const controllerContent = `import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ${serviceNamePascal}Service } from './${serviceNameKebab}.service';
import { SendEmailDto } from './dto/send-email.dto';

@ApiTags('Email')
@Controller('email')
export class ${serviceNamePascal}Controller {
  constructor(private readonly ${serviceNameKebab}Service: ${serviceNamePascal}Service) {}

  @Post('send')
  @ApiOperation({ summary: 'Send email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    await this.${serviceNameKebab}Service.sendEmail(
      sendEmailDto.to,
      sendEmailDto.subject,
      sendEmailDto.content,
      sendEmailDto.html,
    );
    return { message: 'Email sent successfully' };
  }
}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.controller.ts`), controllerContent);

    // Generate DTOs
    const dtoPath = path.join(servicePath, 'dto');
    await fs.ensureDir(dtoPath);
    
    const dtoContent = `import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({ description: 'Recipient email address' })
  @IsEmail()
  to: string;

  @ApiProperty({ description: 'Email subject' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Email content' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'HTML content (optional)', required: false })
  @IsOptional()
  @IsString()
  html?: string;
}
`;
    await fs.writeFile(path.join(dtoPath, 'send-email.dto.ts'), dtoContent);
  }

  private static async generateCacheService(servicePath: string, serviceNameKebab: string, serviceNamePascal: string): Promise<void> {
    // Generate module
    const moduleContent = `import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ${serviceNamePascal}Service } from './${serviceNameKebab}.service';
import { ${serviceNamePascal}Controller } from './${serviceNameKebab}.controller';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60000, // 1 minute
      max: 100, // maximum number of items in cache
    }),
  ],
  controllers: [${serviceNamePascal}Controller],
  providers: [${serviceNamePascal}Service],
  exports: [${serviceNamePascal}Service],
})
export class ${serviceNamePascal}Module {}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.module.ts`), moduleContent);

    // Generate service
    const serviceContent = `import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ${serviceNamePascal}Service {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    return await this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }
}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.service.ts`), serviceContent);

    // Generate controller
    const controllerContent = `import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ${serviceNamePascal}Service } from './${serviceNameKebab}.service';

@ApiTags('Cache')
@Controller('cache')
export class ${serviceNamePascal}Controller {
  constructor(private readonly ${serviceNameKebab}Service: ${serviceNamePascal}Service) {}

  @Get(':key')
  @ApiOperation({ summary: 'Get cached value' })
  @ApiResponse({ status: 200, description: 'Cached value retrieved' })
  async get(@Param('key') key: string) {
    return await this.${serviceNameKebab}Service.get(key);
  }

  @Post()
  @ApiOperation({ summary: 'Set cached value' })
  @ApiResponse({ status: 200, description: 'Value cached successfully' })
  async set(@Body() body: { key: string; value: any; ttl?: number }) {
    await this.${serviceNameKebab}Service.set(body.key, body.value, body.ttl);
    return { message: 'Value cached successfully' };
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete cached value' })
  @ApiResponse({ status: 200, description: 'Value deleted successfully' })
  async del(@Param('key') key: string) {
    await this.${serviceNameKebab}Service.del(key);
    return { message: 'Value deleted successfully' };
  }
}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.controller.ts`), controllerContent);
  }

  private static async generateStorageService(servicePath: string, serviceNameKebab: string, serviceNamePascal: string): Promise<void> {
    // Generate module
    const moduleContent = `import { Module } from '@nestjs/common';
import { ${serviceNamePascal}Service } from './${serviceNameKebab}.service';
import { ${serviceNamePascal}Controller } from './${serviceNameKebab}.controller';

@Module({
  controllers: [${serviceNamePascal}Controller],
  providers: [${serviceNamePascal}Service],
  exports: [${serviceNamePascal}Service],
})
export class ${serviceNamePascal}Module {}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.module.ts`), moduleContent);

    // Generate service
    const serviceContent = `import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class ${serviceNamePascal}Service {
  private s3: AWS.S3;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
  }

  async uploadFile(file: Buffer, filename: string, contentType: string): Promise<string> {
    const bucket = this.configService.get('AWS_S3_BUCKET');
    
    const params = {
      Bucket: bucket,
      Key: filename,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read',
    };

    const result = await this.s3.upload(params).promise();
    return result.Location;
  }

  async deleteFile(filename: string): Promise<void> {
    const bucket = this.configService.get('AWS_S3_BUCKET');
    
    const params = {
      Bucket: bucket,
      Key: filename,
    };

    await this.s3.deleteObject(params).promise();
  }

  getFileUrl(filename: string): string {
    const bucket = this.configService.get('AWS_S3_BUCKET');
    const region = this.configService.get('AWS_REGION');
    return \`https://\${bucket}.s3.\${region}.amazonaws.com/\${filename}\`;
  }
}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.service.ts`), serviceContent);

    // Generate controller
    const controllerContent = `import { Controller, Post, Delete, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { ${serviceNamePascal}Service } from './${serviceNameKebab}.service';

@ApiTags('Storage')
@Controller('storage')
export class ${serviceNamePascal}Controller {
  constructor(private readonly ${serviceNameKebab}Service: ${serviceNamePascal}Service) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file' })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const url = await this.${serviceNameKebab}Service.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );
    return { url };
  }

  @Delete(':filename')
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Param('filename') filename: string) {
    await this.${serviceNameKebab}Service.deleteFile(filename);
    return { message: 'File deleted successfully' };
  }
}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.controller.ts`), controllerContent);
  }

  private static async generateNotificationsService(servicePath: string, serviceNameKebab: string, serviceNamePascal: string): Promise<void> {
    // Generate module
    const moduleContent = `import { Module } from '@nestjs/common';
import { ${serviceNamePascal}Service } from './${serviceNameKebab}.service';
import { ${serviceNamePascal}Controller } from './${serviceNameKebab}.controller';

@Module({
  controllers: [${serviceNamePascal}Controller],
  providers: [${serviceNamePascal}Service],
  exports: [${serviceNamePascal}Service],
})
export class ${serviceNamePascal}Module {}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.module.ts`), moduleContent);

    // Generate service
    const serviceContent = `import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class ${serviceNamePascal}Service {
  private firebase: admin.app.App;

  constructor(private configService: ConfigService) {
    this.firebase = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.configService.get('FIREBASE_PROJECT_ID'),
        privateKey: this.configService.get('FIREBASE_PRIVATE_KEY'),
        clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
      }),
    });
  }

  async sendNotification(token: string, title: string, body: string, data?: any): Promise<void> {
    const message = {
      token,
      notification: {
        title,
        body,
      },
      data,
    };

    await this.firebase.messaging().send(message);
  }

  async sendNotificationToTopic(topic: string, title: string, body: string, data?: any): Promise<void> {
    const message = {
      topic,
      notification: {
        title,
        body,
      },
      data,
    };

    await this.firebase.messaging().send(message);
  }

  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    await this.firebase.messaging().subscribeToTopic(tokens, topic);
  }

  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
    await this.firebase.messaging().unsubscribeFromTopic(tokens, topic);
  }
}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.service.ts`), serviceContent);

    // Generate controller
    const controllerContent = `import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ${serviceNamePascal}Service } from './${serviceNameKebab}.service';
import { SendNotificationDto } from './dto/send-notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class ${serviceNamePascal}Controller {
  constructor(private readonly ${serviceNameKebab}Service: ${serviceNamePascal}Service) {}

  @Post('send')
  @ApiOperation({ summary: 'Send notification' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  async sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    await this.${serviceNameKebab}Service.sendNotification(
      sendNotificationDto.token,
      sendNotificationDto.title,
      sendNotificationDto.body,
      sendNotificationDto.data,
    );
    return { message: 'Notification sent successfully' };
  }

  @Post('topic')
  @ApiOperation({ summary: 'Send notification to topic' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  async sendToTopic(@Body() body: { topic: string; title: string; body: string; data?: any }) {
    await this.${serviceNameKebab}Service.sendNotificationToTopic(
      body.topic,
      body.title,
      body.body,
      body.data,
    );
    return { message: 'Notification sent successfully' };
  }
}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.controller.ts`), controllerContent);

    // Generate DTOs
    const dtoPath = path.join(servicePath, 'dto');
    await fs.ensureDir(dtoPath);
    
    const dtoContent = `import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class SendNotificationDto {
  @ApiProperty({ description: 'Device token' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification body' })
  @IsString()
  body: string;

  @ApiProperty({ description: 'Additional data', required: false })
  @IsOptional()
  data?: any;
}
`;
    await fs.writeFile(path.join(dtoPath, 'send-notification.dto.ts'), dtoContent);
  }

  private static async generatePaymentsService(servicePath: string, serviceNameKebab: string, serviceNamePascal: string): Promise<void> {
    // Generate module
    const moduleContent = `import { Module } from '@nestjs/common';
import { ${serviceNamePascal}Service } from './${serviceNameKebab}.service';
import { ${serviceNamePascal}Controller } from './${serviceNameKebab}.controller';

@Module({
  controllers: [${serviceNamePascal}Controller],
  providers: [${serviceNamePascal}Service],
  exports: [${serviceNamePascal}Service],
})
export class ${serviceNamePascal}Module {}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.module.ts`), moduleContent);

    // Generate service
    const serviceContent = `import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class ${serviceNamePascal}Service {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.create({
      amount,
      currency,
    });
  }

  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    return await this.stripe.customers.create({
      email,
      name,
    });
  }

  async createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
    });
  }

  async refundPayment(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    return await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
    });
  }
}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.service.ts`), serviceContent);

    // Generate controller
    const controllerContent = `import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ${serviceNamePascal}Service } from './${serviceNameKebab}.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@ApiTags('Payments')
@Controller('payments')
export class ${serviceNamePascal}Controller {
  constructor(private readonly ${serviceNameKebab}Service: ${serviceNamePascal}Service) {}

  @Post('payment-intent')
  @ApiOperation({ summary: 'Create payment intent' })
  @ApiResponse({ status: 200, description: 'Payment intent created successfully' })
  async createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    const paymentIntent = await this.${serviceNameKebab}Service.createPaymentIntent(
      createPaymentIntentDto.amount,
      createPaymentIntentDto.currency,
    );
    return { clientSecret: paymentIntent.client_secret };
  }

  @Post('customers')
  @ApiOperation({ summary: 'Create customer' })
  @ApiResponse({ status: 200, description: 'Customer created successfully' })
  async createCustomer(@Body() body: { email: string; name?: string }) {
    const customer = await this.${serviceNameKebab}Service.createCustomer(body.email, body.name);
    return customer;
  }
}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.controller.ts`), controllerContent);

    // Generate DTOs
    const dtoPath = path.join(servicePath, 'dto');
    await fs.ensureDir(dtoPath);
    
    const dtoContent = `import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Amount in cents' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Currency', default: 'usd' })
  @IsOptional()
  @IsString()
  currency?: string;
}
`;
    await fs.writeFile(path.join(dtoPath, 'create-payment-intent.dto.ts'), dtoContent);
  }

  private static async generateSearchService(servicePath: string, serviceNameKebab: string, serviceNamePascal: string): Promise<void> {
    // Generate module
    const moduleContent = `import { Module } from '@nestjs/common';
import { ${serviceNamePascal}Service } from './${serviceNameKebab}.service';
import { ${serviceNamePascal}Controller } from './${serviceNameKebab}.controller';

@Module({
  controllers: [${serviceNamePascal}Controller],
  providers: [${serviceNamePascal}Service],
  exports: [${serviceNamePascal}Service],
})
export class ${serviceNamePascal}Module {}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.module.ts`), moduleContent);

    // Generate service
    const serviceContent = `import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ${serviceNamePascal}Service {
  private client: Client;

  constructor(private configService: ConfigService) {
    this.client = new Client({
      node: this.configService.get('ELASTICSEARCH_NODE'),
      auth: {
        username: this.configService.get('ELASTICSEARCH_USERNAME'),
        password: this.configService.get('ELASTICSEARCH_PASSWORD'),
      },
    });
  }

  async indexDocument(index: string, document: any, id?: string): Promise<void> {
    await this.client.index({
      index,
      id,
      body: document,
    });
  }

  async search(index: string, query: any): Promise<any> {
    const result = await this.client.search({
      index,
      body: query,
    });
    return result.body;
  }

  async deleteDocument(index: string, id: string): Promise<void> {
    await this.client.delete({
      index,
      id,
    });
  }

  async createIndex(index: string, mappings: any): Promise<void> {
    await this.client.indices.create({
      index,
      body: {
        mappings,
      },
    });
  }
}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.service.ts`), serviceContent);

    // Generate controller
    const controllerContent = `import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ${serviceNamePascal}Service } from './${serviceNameKebab}.service';

@ApiTags('Search')
@Controller('search')
export class ${serviceNamePascal}Controller {
  constructor(private readonly ${serviceNameKebab}Service: ${serviceNamePascal}Service) {}

  @Post(':index')
  @ApiOperation({ summary: 'Search documents' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(@Param('index') index: string, @Body() query: any) {
    return await this.${serviceNameKebab}Service.search(index, query);
  }

  @Post(':index/document')
  @ApiOperation({ summary: 'Index document' })
  @ApiResponse({ status: 200, description: 'Document indexed successfully' })
  async indexDocument(@Param('index') index: string, @Body() document: any) {
    await this.${serviceNameKebab}Service.indexDocument(index, document);
    return { message: 'Document indexed successfully' };
  }

  @Delete(':index/document/:id')
  @ApiOperation({ summary: 'Delete document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  async deleteDocument(@Param('index') index: string, @Param('id') id: string) {
    await this.${serviceNameKebab}Service.deleteDocument(index, id);
    return { message: 'Document deleted successfully' };
  }
}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.controller.ts`), controllerContent);
  }

  private static async generateGenericService(servicePath: string, serviceNameKebab: string, serviceNamePascal: string): Promise<void> {
    // Generate module
    const moduleContent = `import { Module } from '@nestjs/common';
import { ${serviceNamePascal}Service } from './${serviceNameKebab}.service';
import { ${serviceNamePascal}Controller } from './${serviceNameKebab}.controller';

@Module({
  controllers: [${serviceNamePascal}Controller],
  providers: [${serviceNamePascal}Service],
  exports: [${serviceNamePascal}Service],
})
export class ${serviceNamePascal}Module {}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.module.ts`), moduleContent);

    // Generate service
    const serviceContent = `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${serviceNamePascal}Service {
  // Implement your ${serviceNameKebab} service logic here
}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.service.ts`), serviceContent);

    // Generate controller
    const controllerContent = `import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ${serviceNamePascal}Service } from './${serviceNameKebab}.service';

@ApiTags('${serviceNamePascal}')
@Controller('${serviceNameKebab}')
export class ${serviceNamePascal}Controller {
  constructor(private readonly ${serviceNameKebab}Service: ${serviceNamePascal}Service) {}

  // Implement your ${serviceNameKebab} controller endpoints here
}
`;
    await fs.writeFile(path.join(servicePath, `${serviceNameKebab}.controller.ts`), controllerContent);
  }

  private static async updateAppModule(serviceName: string, serviceNamePascal: string): Promise<void> {
    const appModulePath = path.join(process.cwd(), 'src', 'app', 'app.module.ts');
    
    if (await fs.pathExists(appModulePath)) {
      let content = await fs.readFile(appModulePath, 'utf-8');
      
      // Add import
      if (!content.includes(`${serviceNamePascal}Module`)) {
        content = content.replace(
          'import { UsersModule } from \'../modules/users/users.module\';',
          `import { UsersModule } from '../modules/users/users.module';
import { ${serviceNamePascal}Module } from '../modules/${kebabCase(serviceName)}/${kebabCase(serviceName)}.module';`
        );
        
        // Add to imports array
        content = content.replace(
          'UsersModule,',
          `UsersModule,
    ${serviceNamePascal}Module,`
        );
      }
      
      await fs.writeFile(appModulePath, content);
    }
  }
}
