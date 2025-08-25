import * as Handlebars from 'handlebars';
import { kebabCase, camelCase, pascalCase, snakeCase } from 'change-case';

export class TemplateRenderer {
  private handlebars: typeof Handlebars;

  constructor() {
    this.handlebars = Handlebars.create();
    this.registerDefaultHelpers();
  }

  private registerDefaultHelpers(): void {
    // Case conversion helpers
    this.handlebars.registerHelper('kebabCase', (str: string) => kebabCase(str));
    this.handlebars.registerHelper('camelCase', (str: string) => camelCase(str));
    this.handlebars.registerHelper('pascalCase', (str: string) => pascalCase(str));
    this.handlebars.registerHelper('snakeCase', (str: string) => snakeCase(str));
    this.handlebars.registerHelper('headerCase', (str: string) => str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('-'));
    this.handlebars.registerHelper('lowerCase', (str: string) => str.toLowerCase());
    this.handlebars.registerHelper('upperCase', (str: string) => str.toUpperCase());
    this.handlebars.registerHelper('titleCase', (str: string) => str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '));

    // String manipulation helpers
    this.handlebars.registerHelper('pluralize', (str: string) => {
      if (str.endsWith('y')) {
        return str.slice(0, -1) + 'ies';
      }
      if (str.endsWith('s') || str.endsWith('sh') || str.endsWith('ch') || str.endsWith('x') || str.endsWith('z')) {
        return str + 'es';
      }
      return str + 's';
    });

    this.handlebars.registerHelper('singularize', (str: string) => {
      if (str.endsWith('ies')) {
        return str.slice(0, -3) + 'y';
      }
      if (str.endsWith('es')) {
        return str.slice(0, -2);
      }
      if (str.endsWith('s')) {
        return str.slice(0, -1);
      }
      return str;
    });

    // Mathematical helpers
    this.handlebars.registerHelper('add', (a: number, b: number) => a + b);
    this.handlebars.registerHelper('subtract', (a: number, b: number) => a - b);
    this.handlebars.registerHelper('multiply', (a: number, b: number) => a * b);
    this.handlebars.registerHelper('divide', (a: number, b: number) => a / b);

    // Array helpers
    this.handlebars.registerHelper('join', (arr: any[], separator: string) => arr.join(separator));
    this.handlebars.registerHelper('length', (arr: any[]) => arr.length);
    this.handlebars.registerHelper('includes', (arr: any[], item: any) => arr.includes(item));

    // Object helpers
    this.handlebars.registerHelper('keys', (obj: any) => Object.keys(obj).join(','));
    this.handlebars.registerHelper('values', (obj: any) => Object.values(obj).join(','));

    // Boolean helpers
    this.handlebars.registerHelper('and', (a: boolean, b: boolean) => a && b);
    this.handlebars.registerHelper('or', (a: boolean, b: boolean) => a || b);
    this.handlebars.registerHelper('not', (a: boolean) => !a);

    // Comparison helpers
    this.handlebars.registerHelper('ifEquals', function(this: any, arg1: any, arg2: any, options: any) {
      return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    });

    // Conditional helpers
    this.handlebars.registerHelper('ifIn', function(this: any, elem: any, list: any[], options: any) {
      return list.includes(elem) ? options.fn(this) : options.inverse(this);
    });
  }

  renderTemplate(template: string, context: any): string {
    try {
      const compiledTemplate = this.handlebars.compile(template);
      return compiledTemplate(context);
    } catch (error) {
      console.error('Template rendering error:', error);
      return template; // Return original template on error
    }
  }

  registerHelper(name: string, helper: any): void {
    this.handlebars.registerHelper(name, helper);
  }

  registerPartial(name: string, partial: string): void {
    this.handlebars.registerPartial(name, partial);
  }

  clearHelpers(): void {
    this.handlebars = Handlebars.create();
    this.registerDefaultHelpers();
  }

  clearPartials(): void {
    this.handlebars.unregisterPartial('*');
  }
}

// Legacy export for backward compatibility
export function renderTemplate(template: string, context: any): string {
  const renderer = new TemplateRenderer();
  return renderer.renderTemplate(template, context);
}
