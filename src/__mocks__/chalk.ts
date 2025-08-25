const chalk = {
  blue: jest.fn((text: string) => text),
  green: jest.fn((text: string) => text),
  red: jest.fn((text: string) => text),
  yellow: jest.fn((text: string) => text),
  cyan: jest.fn((text: string) => text),
  magenta: jest.fn((text: string) => text),
  white: jest.fn((text: string) => text),
  gray: jest.fn((text: string) => text),
  bold: jest.fn((text: string) => text),
  dim: jest.fn((text: string) => text),
  italic: jest.fn((text: string) => text),
  underline: jest.fn((text: string) => text),
  strikethrough: jest.fn((text: string) => text),
  reset: jest.fn((text: string) => text),
  // Chain methods
  chain: {
    blue: jest.fn((text: string) => text),
    green: jest.fn((text: string) => text),
    red: jest.fn((text: string) => text),
    yellow: jest.fn((text: string) => text),
    cyan: jest.fn((text: string) => text),
    magenta: jest.fn((text: string) => text),
    white: jest.fn((text: string) => text),
    gray: jest.fn((text: string) => text),
    bold: jest.fn((text: string) => text),
    dim: jest.fn((text: string) => text),
    italic: jest.fn((text: string) => text),
    underline: jest.fn((text: string) => text),
    strikethrough: jest.fn((text: string) => text),
    reset: jest.fn((text: string) => text)
  }
};

// Make chalk methods chainable
Object.keys(chalk).forEach(key => {
  if (typeof chalk[key as keyof typeof chalk] === 'function') {
    (chalk[key as keyof typeof chalk] as any).chain = chalk.chain;
  }
});

export default chalk;
