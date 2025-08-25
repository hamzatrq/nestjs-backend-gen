const ora = jest.fn().mockReturnValue({
  start: jest.fn().mockReturnThis(),
  stop: jest.fn().mockReturnThis(),
  succeed: jest.fn().mockReturnThis(),
  fail: jest.fn().mockReturnThis(),
  warn: jest.fn().mockReturnThis(),
  info: jest.fn().mockReturnThis(),
  text: jest.fn().mockReturnThis(),
  color: jest.fn().mockReturnThis(),
  frame: jest.fn().mockReturnThis(),
  render: jest.fn().mockReturnThis(),
  clear: jest.fn().mockReturnThis(),
  stopAndPersist: jest.fn().mockReturnThis()
});

export default ora;
