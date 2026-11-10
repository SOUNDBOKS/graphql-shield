import type { GraphQLResolveInfo, GraphQLSchema } from 'graphql';

// Rule

export type ShieldRule = IRule | ILogicRule;

export interface IRule {
  readonly name: string;

  equals(rule: IRule): boolean;
  resolve(parent: object, args: object, ctx: IShieldContext, info: GraphQLResolveInfo, options: IOptions): Promise<IRuleResult>;
}

export interface IRuleOptions {
  cache: ICache;
}

export interface ILogicRule {
  getRules(): ShieldRule[];
  evaluate(
    parent: object,
    args: object,
    ctx: IShieldContext,
    info: GraphQLResolveInfo,
    options: IOptions,
  ): Promise<IRuleResult[]>;
  resolve(parent: object, args: object, ctx: IShieldContext, info: GraphQLResolveInfo, options: IOptions): Promise<IRuleResult>;
}

export type ICache = 'strict' | 'contextual' | 'no_cache' | ICacheKeyFn;
export type ICacheKeyFn = (parent: any, args: any, ctx: any, info: GraphQLResolveInfo) => string;
export type IRuleResult = boolean | string | Error;
export type IRuleFunction = (parent: any, args: any, ctx: any, info: GraphQLResolveInfo) => IRuleResult | Promise<IRuleResult>;

// Rule Constructor Options

export type ICacheContructorOptions = ICache | boolean;

export interface IRuleConstructorOptions {
  cache?: ICacheContructorOptions;
}

// Rules Definition Tree

export interface IRuleTypeMap {
  [key: string]: ShieldRule | IRuleFieldMap;
}

export interface IRuleFieldMap {
  [key: string]: ShieldRule;
}

export type IRules = ShieldRule | IRuleTypeMap;

export type IHashFunction = (arg: { parent: any; args: any }) => string;

export type IFallbackErrorMapperType = (
  err: unknown,
  parent: object,
  args: object,
  ctx: IShieldContext,
  info: GraphQLResolveInfo,
) => Promise<Error> | Error;

export type IFallbackErrorType = Error | IFallbackErrorMapperType;

// Generator Options

export interface IOptions {
  debug: boolean;
  allowExternalErrors: boolean;
  fallbackRule: ShieldRule;
  fallbackError?: IFallbackErrorType;
  hashFunction: IHashFunction;
}

export interface IOptionsConstructor {
  debug?: boolean;
  allowExternalErrors?: boolean;
  fallbackRule?: ShieldRule;
  fallbackError?: string | IFallbackErrorType;
  hashFunction?: IHashFunction;
}

/** Returns a copy of the schema with every object field guarded by its rule. */
export type IShield = (schema: GraphQLSchema) => GraphQLSchema;

export interface IShieldContext {
  _shield: {
    cache: { [key: string]: IRuleResult | Promise<IRuleResult> };
  };
}
