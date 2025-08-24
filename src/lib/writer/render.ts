import Handlebars from 'handlebars';
import { kebabCase, camelCase, pascalCase, snakeCase, constantCase, dotCase } from 'change-case';
import { TemplateContext } from '../types';

export class TemplateRenderer {
  /**
   * Register custom handlebars helpers
   */
  static registerHelpers(): void {
    // Case conversion helpers
    Handlebars.registerHelper('kebabCase', (str: string) => kebabCase(str));
    Handlebars.registerHelper('camelCase', (str: string) => camelCase(str));
    Handlebars.registerHelper('pascalCase', (str: string) => pascalCase(str));
    Handlebars.registerHelper('snakeCase', (str: string) => snakeCase(str));
    Handlebars.registerHelper('constantCase', (str: string) => constantCase(str));
    Handlebars.registerHelper('dotCase', (str: string) => dotCase(str));
    Handlebars.registerHelper('headerCase', (str: string) => str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('-'));
    Handlebars.registerHelper('lowerCase', (str: string) => str.toLowerCase());
    Handlebars.registerHelper('upperCase', (str: string) => str.toUpperCase());
    Handlebars.registerHelper('titleCase', (str: string) => str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '));

    // Conditional helpers
    Handlebars.registerHelper('ifEquals', (arg1: any, arg2: any, options: any) => {
      return arg1 === arg2 ? options.fn({}) : options.inverse({});
    });

    Handlebars.registerHelper('ifNotEquals', (arg1: any, arg2: any, options: any) => {
      return arg1 !== arg2 ? options.fn({}) : options.inverse({});
    });

    Handlebars.registerHelper('ifIn', (elem: any, list: any[], options: any) => {
      return list.includes(elem) ? options.fn({}) : options.inverse({});
    });

    Handlebars.registerHelper('ifNotIn', (elem: any, list: any[], options: any) => {
      return !list.includes(elem) ? options.fn({}) : options.inverse({});
    });

    // Array helpers
    Handlebars.registerHelper('join', function(array: any[], separator: string) {
      return array.join(separator);
    });

    Handlebars.registerHelper('each', (array: any[], options: any) => {
      if (!Array.isArray(array)) {
        return options.inverse({});
      }
      
      let result = '';
      for (let i = 0; i < array.length; i++) {
        result += options.fn(array[i], { data: { index: i, first: i === 0, last: i === array.length - 1 } });
      }
      return result;
    });

    // String helpers
    Handlebars.registerHelper('pluralize', function(str: string) {
      if (str.endsWith('y')) {
        return str.slice(0, -1) + 'ies';
      }
      if (str.endsWith('s') || str.endsWith('sh') || str.endsWith('ch') || str.endsWith('x') || str.endsWith('z')) {
        return str + 'es';
      }
      return str + 's';
    });

    Handlebars.registerHelper('singularize', function(str: string) {
      if (str.endsWith('ies')) {
        return str.slice(0, -3) + 'y';
      }
      if (str.endsWith('es')) {
        const withoutEs = str.slice(0, -2);
        if (withoutEs.endsWith('s') || withoutEs.endsWith('sh') || withoutEs.endsWith('ch') || withoutEs.endsWith('x') || withoutEs.endsWith('z')) {
          return withoutEs;
        }
      }
      if (str.endsWith('s')) {
        return str.slice(0, -1);
      }
      return str;
    });

    // Boolean helpers
    Handlebars.registerHelper('and', function(...args: any[]) {
      return args.slice(0, -1).every(Boolean);
    });

    Handlebars.registerHelper('or', function(...args: any[]) {
      return args.slice(0, -1).some(Boolean);
    });

    Handlebars.registerHelper('not', function(value: any) {
      return !value;
    });

    // Math helpers
    Handlebars.registerHelper('add', function(a: number, b: number) {
      return a + b;
    });

    Handlebars.registerHelper('subtract', function(a: number, b: number) {
      return a - b;
    });

    Handlebars.registerHelper('multiply', function(a: number, b: number) {
      return a * b;
    });

    Handlebars.registerHelper('divide', function(a: number, b: number) {
      return a / b;
    });

    // Object helpers
    Handlebars.registerHelper('get', function(obj: any, key: string) {
      return obj[key];
    });

    Handlebars.registerHelper('keys', function(obj: any) {
      return Object.keys(obj);
    });

    Handlebars.registerHelper('values', function(obj: any) {
      return Object.values(obj);
    });

    // Type helpers
    Handlebars.registerHelper('isString', function(value: any) {
      return typeof value === 'string';
    });

    Handlebars.registerHelper('isNumber', function(value: any) {
      return typeof value === 'number';
    });

    Handlebars.registerHelper('isBoolean', function(value: any) {
      return typeof value === 'boolean';
    });

    Handlebars.registerHelper('isArray', function(value: any) {
      return Array.isArray(value);
    });

    Handlebars.registerHelper('isObject', function(value: any) {
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    });
  }

  /**
   * Render a template string with context
   */
  static render(template: string, context: TemplateContext): string {
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(context);
  }

  /**
   * Render a template file with context
   */
  static async renderFile(templatePath: string, context: TemplateContext): Promise<string> {
    const fs = await import('fs-extra');
    const template = await fs.readFile(templatePath, 'utf-8');
    return this.render(template, context);
  }
}

// Register helpers when module is loaded
TemplateRenderer.registerHelpers();
