import { INestApplication } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';

export function setupLogger(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const logLevel = configService.get('LOG_LEVEL', 'info');
  const logDestination = configService.get('LOG_DESTINATION', 'console');
  const logFilePath = configService.get('LOG_FILE_PATH', 'logs/app.log');

  const transports: winston.transport[] = [];

  // Console transport
  if (logDestination === 'console' || logDestination === 'json') {
    transports.push(
      new winston.transports.Console({
        format: logDestination === 'json' 
          ? winston.format.json()
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.timestamp(),
              winston.format.printf(({ timestamp, level, message, context }) => {
                return `${timestamp} [${context}] ${level}: ${message}`;
              }),
            ),
      }),
    );
  }

  // File transport
  if (logDestination === 'file' || logDestination === 'json') {
    transports.push(
      new winston.transports.File({
        filename: logFilePath,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    );
  }

  const logger = WinstonModule.createLogger({
    level: logLevel,
    transports,
  });

  app.useLogger(logger);
}
