import { logger } from '../index';

jest.mock('../../config', () => ({
  config: {
    app: {
      logLevel: 'info',
      environment: 'test'
    }
  }
}));

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should log info messages', () => {
    logger.info('test message', { key: 'value' });
    expect(console.log).toHaveBeenCalled();
  });

  it('should log error messages', () => {
    const error = new Error('test error');
    logger.error('error message', error);
    expect(console.error).toHaveBeenCalled();
  });

  it('should log warnings', () => {
    logger.warn('warning message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should not log debug when level is info', () => {
    logger.debug('debug message');
    expect(console.log).not.toHaveBeenCalled();
  });
});