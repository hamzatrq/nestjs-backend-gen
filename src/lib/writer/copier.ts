import fs from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';
import { TemplateContext } from '../types';

export class TemplateCopier {
  /**
   * Copy template directory to target location with handlebars rendering
   */
  static async copyTemplate(
    templatePath: string,
    targetPath: string,
    context: TemplateContext,
    overwrite = false
  ): Promise<void> {
    if (!(await fs.pathExists(templatePath))) {
      throw new Error(`Template path does not exist: ${templatePath}`);
    }

    const stats = await fs.stat(templatePath);
    
    if (stats.isFile()) {
      await this.copyFile(templatePath, targetPath, context, overwrite);
    } else if (stats.isDirectory()) {
      await this.copyDirectory(templatePath, targetPath, context, overwrite);
    }
  }

  /**
   * Copy a single file with handlebars rendering
   */
  private static async copyFile(
    sourcePath: string,
    targetPath: string,
    context: TemplateContext,
    overwrite = false
  ): Promise<void> {
    if (await fs.pathExists(targetPath) && !overwrite) {
      return; // Skip if file exists and overwrite is false
    }

    const content = await fs.readFile(sourcePath, 'utf-8');
    const template = Handlebars.compile(content);
    const renderedContent = template(context);
    
    await fs.ensureDir(path.dirname(targetPath));
    await fs.writeFile(targetPath, renderedContent);
  }

  /**
   * Copy directory recursively with handlebars rendering
   */
  private static async copyDirectory(
    sourcePath: string,
    targetPath: string,
    context: TemplateContext,
    overwrite = false
  ): Promise<void> {
    const items = await fs.readdir(sourcePath);

    for (const item of items) {
      const sourceItemPath = path.join(sourcePath, item);
      const targetItemPath = path.join(targetPath, item);
      
      const stats = await fs.stat(sourceItemPath);
      
      if (stats.isDirectory()) {
        await fs.ensureDir(targetItemPath);
        await this.copyDirectory(sourceItemPath, targetItemPath, context, overwrite);
      } else {
        await this.copyFile(sourceItemPath, targetItemPath, context, overwrite);
      }
    }
  }

  /**
   * Copy file without handlebars rendering (for binary files)
   */
  static async copyFileRaw(
    sourcePath: string,
    targetPath: string,
    overwrite = false
  ): Promise<void> {
    if (await fs.pathExists(targetPath) && !overwrite) {
      return;
    }

    await fs.ensureDir(path.dirname(targetPath));
    await fs.copy(sourcePath, targetPath);
  }

  /**
   * Create a file with content
   */
  static async createFile(
    targetPath: string,
    content: string,
    overwrite = false
  ): Promise<void> {
    if (await fs.pathExists(targetPath) && !overwrite) {
      return;
    }

    await fs.ensureDir(path.dirname(targetPath));
    await fs.writeFile(targetPath, content);
  }

  /**
   * Append content to a file
   */
  static async appendToFile(targetPath: string, content: string): Promise<void> {
    await fs.ensureDir(path.dirname(targetPath));
    await fs.appendFile(targetPath, content);
  }
}
