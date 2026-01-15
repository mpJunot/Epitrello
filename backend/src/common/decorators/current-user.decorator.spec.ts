import 'reflect-metadata';
import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentUser } from './current-user.decorator';

describe('CurrentUser decorator', () => {
  it('should extract user from GraphQL context', () => {
    class TestResolver {
      test(@CurrentUser() user: any) {
        return user;
      }
    }

    const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestResolver, 'test');
    const key = Object.keys(metadata)[0];
    const { factory } = metadata[key];

    const mockContext = {
      getType: () => 'graphql',
      getArgs: () => [null, {}, { req: { user: { id: 'user-1' } } }, null],
      getClass: () => TestResolver,
      getHandler: () => TestResolver.prototype.test,
    } as unknown as ExecutionContext;

    const result = factory(undefined, mockContext);

    expect(result).toEqual({ id: 'user-1' });
  });
});
