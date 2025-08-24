import { CrudEntity } from '../types';
import { execa } from 'execa';


export class PrismaSchemaWriter {
  static async updateSchema(entity: CrudEntity): Promise<void> {
    // Generate Prisma client
    await this.generatePrismaClient();
    
    // Create and run migration
    await this.createMigration(entity);
  }

  private static async generatePrismaClient(): Promise<void> {
    try {
      await execa('npx', ['prisma', 'generate'], {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
    } catch (error) {
      console.error('Failed to generate Prisma client:', error);
      throw error;
    }
  }

  private static async createMigration(entity: CrudEntity): Promise<void> {
    try {
      const migrationName = `add_${entity.name.toLowerCase()}_entity`;
      
      await execa('npx', ['prisma', 'migrate', 'dev', '--name', migrationName], {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
    } catch (error) {
      console.error('Failed to create migration:', error);
      throw error;
    }
  }

  static async runMigrations(): Promise<void> {
    try {
      await execa('npx', ['prisma', 'migrate', 'deploy'], {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
    } catch (error) {
      console.error('Failed to run migrations:', error);
      throw error;
    }
  }

  static async resetDatabase(): Promise<void> {
    try {
      await execa('npx', ['prisma', 'migrate', 'reset', '--force'], {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
    } catch (error) {
      console.error('Failed to reset database:', error);
      throw error;
    }
  }
}
