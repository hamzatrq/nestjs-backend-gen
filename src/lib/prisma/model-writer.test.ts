import { PrismaModelWriter } from './model-writer';

describe('PrismaModelWriter', () => {
  describe('generateModel', () => {
    it('should be a static method', () => {
      expect(typeof PrismaModelWriter.generateModel).toBe('function');
    });
  });
});
