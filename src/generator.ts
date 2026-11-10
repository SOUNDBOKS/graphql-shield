import { MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, isObjectType, type GraphQLFieldResolver, type GraphQLSchema } from 'graphql';
import type { IRules, IOptions, ShieldRule, IShieldContext } from './types.js';
import { isRuleFunction } from './utils.js';
import { ValidationError } from './validation.js';

/**
 *
 * @param resolve
 * @param rule
 * @param options
 *
 * Wraps a field resolver so it only runs when the rule allows it,
 * and initializes the cache object in context.
 *
 */
function wrapResolverWithRule(
  resolve: GraphQLFieldResolver<any, any>,
  rule: ShieldRule,
  options: IOptions,
): GraphQLFieldResolver<any, IShieldContext | undefined> {
  return async (parent, args, context, info) => {
    const ctx = context ?? ({} as IShieldContext);
    if (!ctx._shield) {
      ctx._shield = { cache: {} };
    }

    try {
      const res = await rule.resolve(parent, args, ctx, info, options);

      if (res === true) {
        return await resolve(parent, args, ctx, info);
      } else if (res === false) {
        if (typeof options.fallbackError === 'function') {
          return await options.fallbackError(null, parent, args, ctx, info);
        }
        return options.fallbackError;
      } else {
        return res;
      }
    } catch (err) {
      if (options.debug) {
        throw err;
      } else if (options.allowExternalErrors) {
        return err;
      } else {
        if (typeof options.fallbackError === 'function') {
          return await options.fallbackError(err, parent, args, ctx, info);
        }
        return options.fallbackError;
      }
    }
  };
}

/**
 *
 * @param schema
 * @param rules
 *
 * Throws when the rule tree names types or fields the schema doesn't have.
 *
 */
function validateRuleTreeAgainstSchema(schema: GraphQLSchema, rules: IRules): void {
  if (isRuleFunction(rules)) return;

  const typeMap = schema.getTypeMap();

  const typeErrors = Object.keys(rules)
    .filter((type) => !Object.prototype.hasOwnProperty.call(typeMap, type))
    .join(', ');

  if (typeErrors.length > 0) {
    throw new ValidationError(
      `It seems like you have applied rules to ${typeErrors} types but Shield cannot find them in your schema.`,
    );
  }

  const fieldErrors = Object.entries(rules)
    .flatMap(([typeName, typeRules]) => {
      const type = typeMap[typeName];
      if (!isObjectType(type) || isRuleFunction(typeRules)) return [];

      const fieldMap = type.getFields();
      return Object.keys(typeRules)
        .filter((field) => field !== '*' && !Object.prototype.hasOwnProperty.call(fieldMap, field))
        .map((field) => `${typeName}.${field}`);
    })
    .join(', ');

  if (fieldErrors.length > 0) {
    throw new ValidationError(
      `It seems like you have applied rules to ${fieldErrors} fields but Shield cannot find them in your schema.`,
    );
  }
}

/**
 *
 * @param rules
 * @param typeName
 * @param fieldName
 * @param options
 *
 * Picks the most specific rule for a field: field rule, type wildcard, type rule, schema rule, then fallbackRule.
 *
 */
function findRuleForField(rules: IRules, typeName: string, fieldName: string, options: IOptions): ShieldRule {
  if (isRuleFunction(rules)) return rules;

  const typeRules = rules[typeName];
  if (typeRules === undefined) return options.fallbackRule;
  if (isRuleFunction(typeRules)) return typeRules;

  return typeRules[fieldName] ?? typeRules['*'] ?? options.fallbackRule;
}

/**
 *
 * @param schema
 * @param rules
 * @param options
 *
 * Returns a copy of the schema where every object field resolver is guarded by its rule.
 *
 */
export function applyRuleTreeToSchema(schema: GraphQLSchema, rules: IRules, options: IOptions): GraphQLSchema {
  validateRuleTreeAgainstSchema(schema, rules);

  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (field, fieldName, typeName) => ({
      ...field,
      resolve: wrapResolverWithRule(
        field.resolve ?? defaultFieldResolver,
        findRuleForField(rules, typeName, fieldName, options),
        options,
      ),
    }),
  });
}
