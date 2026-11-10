import hash from 'object-hash';
import type { GraphQLSchema } from 'graphql';
import { ValidationError, validateRuleTree } from './validation.js';
import type { IRules, IOptions, IOptionsConstructor, IShield, ShieldRule, IHashFunction, IFallbackErrorType } from './types.js';
import { applyRuleTreeToSchema } from './generator.js';
import { allow } from './constructors.js';
import { withDefault } from './utils.js';

/**
 *
 * @param options
 *
 * Makes sure all of defined rules are in accord with the options
 * shield can process.
 *
 */
function normalizeOptions(options: IOptionsConstructor): IOptions {
  if (typeof options.fallbackError === 'string') {
    options.fallbackError = new Error(options.fallbackError);
  }

  return {
    debug: options.debug !== undefined ? options.debug : false,
    allowExternalErrors: withDefault(false)(options.allowExternalErrors),
    fallbackRule: withDefault<ShieldRule>(allow)(options.fallbackRule),
    fallbackError: withDefault<IFallbackErrorType>(new Error('Not Authorised!'))(options.fallbackError),
    hashFunction: withDefault<IHashFunction>(hash)(options.hashFunction),
  };
}

/**
 *
 * @param ruleTree
 * @param options
 *
 * Validates rules and generates middleware from defined rule tree.
 *
 */
export function shield(ruleTree: IRules, options: IOptionsConstructor = {}): IShield {
  const normalizedOptions = normalizeOptions(options);
  const ruleTreeValidity = validateRuleTree(ruleTree);

  if (ruleTreeValidity.status === 'ok') {
    return (schema: GraphQLSchema) => applyRuleTreeToSchema(schema, ruleTree, normalizedOptions);
  } else {
    throw new ValidationError(ruleTreeValidity.message);
  }
}
