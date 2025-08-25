import { TemplateRenderer } from './render';

describe('TemplateRenderer', () => {
  let renderer: TemplateRenderer;

  beforeEach(() => {
    renderer = new TemplateRenderer();
  });

  describe('renderTemplate', () => {
    it('should render simple variables', () => {
      const template = 'Hello {{name}}!';
      const context = { name: 'World' };
      const result = renderer.renderTemplate(template, context);
      expect(result).toBe('Hello World!');
    });

    it('should render nested properties', () => {
      const template = 'Hello {{user.name}}!';
      const context = { user: { name: 'John' } };
      const result = renderer.renderTemplate(template, context);
      expect(result).toBe('Hello John!');
    });

    it('should handle missing variables gracefully', () => {
      const template = 'Hello {{name}}!';
      const context = {};
      const result = renderer.renderTemplate(template, context);
      expect(result).toBe('Hello !');
    });

    it('should handle malformed templates gracefully', () => {
      const template = 'Hello {{name}!'; // Missing closing brace
      const context = { name: 'World' };
      const result = renderer.renderTemplate(template, context);
      expect(result).toBe(template); // Should return original template on error
    });
  });

  describe('case conversion helpers', () => {
    it('should convert to kebab case', () => {
      const template = '{{kebabCase name}}';
      const context = { name: 'UserProfile' };
      const result = renderer.renderTemplate(template, context);
      expect(result).toBe('user-profile');
    });

    it('should convert to camel case', () => {
      const template = '{{camelCase name}}';
      const context = { name: 'user profile' };
      const result = renderer.renderTemplate(template, context);
      expect(result).toBe('userProfile');
    });

    it('should convert to pascal case', () => {
      const template = '{{pascalCase name}}';
      const context = { name: 'user profile' };
      const result = renderer.renderTemplate(template, context);
      expect(result).toBe('UserProfile');
    });

    it('should convert to snake case', () => {
      const template = '{{snakeCase name}}';
      const context = { name: 'UserProfile' };
      const result = renderer.renderTemplate(template, context);
      expect(result).toBe('user_profile');
    });
  });

  describe('string manipulation helpers', () => {
    it('should pluralize words', () => {
      const template = '{{pluralize word}}';
      const context = { word: 'user' };
      const result = renderer.renderTemplate(template, context);
      expect(result).toBe('users');
    });

    it('should singularize words', () => {
      const template = '{{singularize word}}';
      const context = { word: 'users' };
      const result = renderer.renderTemplate(template, context);
      expect(result).toBe('user');
    });
  });

  describe('mathematical helpers', () => {
    it('should add numbers', () => {
      const template = '{{add a b}}';
      const context = { a: 5, b: 3 };
      const result = renderer.renderTemplate(template, context);
      expect(result).toBe('8');
    });

    it('should multiply numbers', () => {
      const template = '{{multiply a b}}';
      const context = { a: 4, b: 6 };
      const result = renderer.renderTemplate(template, context);
      expect(result).toBe('24');
    });
  });

  describe('array helpers', () => {
    it('should join array elements', () => {
      const template = '{{join items ","}}';
      const context = { items: ['a', 'b', 'c'] };
      const result = renderer.renderTemplate(template, context);
      expect(result).toBe('a,b,c');
    });

    it('should get array length', () => {
      const template = '{{length items}}';
      const context = { items: ['a', 'b', 'c'] };
      const result = renderer.renderTemplate(template, context);
      expect(result).toBe('3');
    });
  });

  describe('conditional helpers', () => {
    it('should handle ifEquals', () => {
      const template = '{{#ifEquals value "test"}}Match{{else}}No match{{/ifEquals}}';
      const context = { value: 'test' };
      const result = renderer.renderTemplate(template, context);
      expect(result).toBe('Match');
    });

    it('should handle ifIn', () => {
      const template = '{{#ifIn value items}}Found{{else}}Not found{{/ifIn}}';
      const context = { value: 'a', items: ['a', 'b', 'c'] };
      const result = renderer.renderTemplate(template, context);
      expect(result).toBe('Found');
    });
  });

  describe('custom helpers', () => {
    it('should register custom helper', () => {
      renderer.registerHelper('greet', (name: string) => `Hello ${name}!`);
      const template = '{{greet name}}';
      const context = { name: 'World' };
      const result = renderer.renderTemplate(template, context);
      expect(result).toBe('Hello World!');
    });
  });

  describe('error handling', () => {
    it('should handle circular references gracefully', () => {
      const obj: any = { name: 'test' };
      obj.self = obj;
      const template = '{{name}}';
      const context = obj;
      const result = renderer.renderTemplate(template, context);
      expect(result).toBe('test');
    });
  });
});
