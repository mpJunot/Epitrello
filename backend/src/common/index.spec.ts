import * as commonExports from './index';

describe('common index exports', () => {
  it('should export common utilities', () => {
    expect(commonExports).toBeDefined();
    expect(commonExports).toHaveProperty('CurrentUser');
    expect(commonExports).toHaveProperty('Public');
    expect(commonExports).toHaveProperty('GqlAuthGuard');
    expect(commonExports).toHaveProperty('LoggingInterceptor');
  });
});
