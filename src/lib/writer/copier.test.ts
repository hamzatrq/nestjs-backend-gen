import { TemplateCopier } from './copier';

// Mock fs-extra
jest.mock('fs-extra');

describe('TemplateCopier', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('copyTemplate', () => {
    it('should be a static method', () => {
      expect(typeof TemplateCopier.copyTemplate).toBe('function');
    });
  });

  describe('copyFileRaw', () => {
    it('should be a static method', () => {
      expect(typeof TemplateCopier.copyFileRaw).toBe('function');
    });
  });

  describe('createFile', () => {
    it('should be a static method', () => {
      expect(typeof TemplateCopier.createFile).toBe('function');
    });
  });

  describe('appendToFile', () => {
    it('should be a static method', () => {
      expect(typeof TemplateCopier.appendToFile).toBe('function');
    });
  });
});
