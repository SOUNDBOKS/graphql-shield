import { makeExecutableSchema } from '@graphql-tools/schema';
import { applyMiddleware } from 'graphql-middleware';
import { shield, rule } from '../src/index.js';
import { graphql } from 'graphql';

describe('generates correct middleware', () => {
  test('correctly applies schema rule to schema', async () => {
    /* Schema */

    const typeDefs = `
      type Query {
        a: String
        type: Type
      }
      type Type {
        a: String
      }
    `;

    const resolvers = {
      Query: {
        a: () => 'a',
        type: () => ({}),
      },
      Type: {
        a: () => 'a',
      },
    };

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    /* Permissions */

    const allowMock = vi.fn().mockResolvedValue(true);
    const permissions = shield(rule({ cache: 'no_cache' })(allowMock));

    const schemaWithPermissions = applyMiddleware(schema, permissions);

    /* Execution */
    const query = `
      query {
        a
        type {
          a
        }
      }
    `;

    const res = await graphql({
      schema: schemaWithPermissions,
      source: query,
    });

    /* Tests */

    expect(res).toEqual({
      data: {
        a: 'a',
        type: {
          a: 'a',
        },
      },
    });
    expect(allowMock).toHaveBeenCalledTimes(3);
  });

  test('correctly applies type rule to type', async () => {
    /* Schema */

    const typeDefs = `
      type Query {
        a: String
        type: Type
      }
      type Type {
        a: String
      }
    `;

    const resolvers = {
      Query: {
        a: () => 'a',
        type: () => ({}),
      },
      Type: {
        a: () => 'a',
      },
    };

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    /* Permissions */

    const allowMock = vi.fn().mockResolvedValue(true);
    const permissions = shield({
      Query: rule({ cache: 'no_cache' })(allowMock),
    });

    const schemaWithPermissions = applyMiddleware(schema, permissions);

    /* Execution */
    const query = `
      query {
        a
        type {
          a
        }
      }
    `;

    const res = await graphql({
      schema: schemaWithPermissions,
      source: query,
    });

    /* Tests */

    expect(res).toEqual({
      data: {
        a: 'a',
        type: {
          a: 'a',
        },
      },
    });
    expect(allowMock).toHaveBeenCalledTimes(2);
  });

  test('correctly applies field rule to field', async () => {
    /* Schema */

    const typeDefs = `
      type Query {
        a: String
        type: Type
      }
      type Type {
        a: String
      }
    `;

    const resolvers = {
      Query: {
        a: () => 'a',
        type: () => ({}),
      },
      Type: {
        a: () => 'a',
      },
    };

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    /* Permissions */

    const allowMock = vi.fn().mockResolvedValue(true);
    const permissions = shield({
      Query: { a: rule({ cache: 'no_cache' })(allowMock) },
    });

    const schemaWithPermissions = applyMiddleware(schema, permissions);

    /* Execution */
    const query = `
      query {
        a
        type {
          a
        }
      }
    `;

    const res = await graphql({
      schema: schemaWithPermissions,
      source: query,
    });

    /* Tests */

    expect(res).toEqual({
      data: {
        a: 'a',
        type: {
          a: 'a',
        },
      },
    });
    expect(allowMock).toHaveBeenCalledTimes(1);
  });

  test('correctly applies wildcard rule to type', async () => {
    /* Schema */

    const typeDefs = `
      type Query {
        a: String
        b: String
        type: Type
      }
      type Type {
        field1: String
        field2: String
      }
    `;

    const resolvers = {
      Query: {
        a: () => 'a',
        b: () => 'b',
        type: () => ({
          field1: 'field1',
          field2: 'field2',
        }),
      },
    };

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    /* Permissions */

    const allowMock = vi.fn().mockResolvedValue(true);
    const defaultQueryMock = vi.fn().mockResolvedValue(true);
    const defaultTypeMock = vi.fn().mockResolvedValue(true);

    const permissions = shield({
      Query: {
        a: rule({ cache: 'no_cache' })(allowMock),
        type: rule({ cache: 'no_cache' })(vi.fn().mockResolvedValue(true)),
        '*': rule({ cache: 'no_cache' })(defaultQueryMock),
      },
      Type: {
        '*': rule({ cache: 'no_cache' })(defaultTypeMock),
      },
    });

    const schemaWithPermissions = applyMiddleware(schema, permissions);

    /* Execution */
    const query = `
      query {
        a
        b
        type {
          field1
          field2
        }
      }
    `;

    const res = await graphql({
      schema: schemaWithPermissions,
      source: query,
    });

    /* Tests */

    expect(res).toEqual({
      data: {
        a: 'a',
        b: 'b',
        type: {
          field1: 'field1',
          field2: 'field2',
        },
      },
    });
    expect(allowMock).toHaveBeenCalledTimes(1);
    expect(defaultQueryMock).toHaveBeenCalledTimes(1);
    expect(defaultTypeMock).toHaveBeenCalledTimes(2);
  });

  test('correctly allows multiple uses of the same wildcard rule', async () => {
    /* Schema */

    const typeDefs = `
      type Query {
        a: String
        b: String
        type: Type
      }
      type Type {
        field1: String
        field2: String
      }
    `;

    const resolvers = {
      Query: {
        a: () => 'a',
        b: () => 'b',
        type: () => ({
          field1: 'field1',
          field2: 'field2',
        }),
      },
    };

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    /* Permissions */

    const allowMock = vi.fn().mockResolvedValue(true);
    const defaultQueryMock = vi.fn().mockResolvedValue(true);
    const defaultTypeMock = vi.fn().mockResolvedValue(true);

    const permissions = shield({
      Query: {
        a: rule({ cache: 'no_cache' })(allowMock),
        type: rule({ cache: 'no_cache' })(vi.fn().mockResolvedValue(true)),
        '*': rule({ cache: 'no_cache' })(defaultQueryMock),
      },
      Type: {
        '*': rule({ cache: 'no_cache' })(defaultTypeMock),
      },
    });

    /* First usage */
    applyMiddleware(schema, permissions);

    /* Second usage */
    const schemaWithPermissions = applyMiddleware(schema, permissions);

    /* Execution */
    const query = `
      query {
        a
        b
        type {
          field1
          field2
        }
      }
    `;

    const res = await graphql({
      schema: schemaWithPermissions,
      source: query,
    });

    /* Tests */

    expect(res).toEqual({
      data: {
        a: 'a',
        b: 'b',
        type: {
          field1: 'field1',
          field2: 'field2',
        },
      },
    });
    expect(allowMock).toHaveBeenCalledTimes(1);
    expect(defaultQueryMock).toHaveBeenCalledTimes(1);
    expect(defaultTypeMock).toHaveBeenCalledTimes(2);
  });
});
