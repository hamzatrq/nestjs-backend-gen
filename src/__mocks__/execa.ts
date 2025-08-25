export const execa = jest.fn().mockResolvedValue({
  stdout: '',
  stderr: '',
  exitCode: 0,
  failed: false,
  killed: false,
  signal: null,
  command: '',
  escapedCommand: '',
  timedOut: false,
  isCanceled: false
});

export default execa;
