import {checkerToGuard} from './Checker';
import {thenGuard} from './combinators';
import {ReasonGuard} from './ReasonGuard';

type Primitive = 'string'|'number'|'bigint'|'boolean'|'symbol'|'undefined'|'object'|'function';
// Dangerous -- do not export!
// We cannot guarantee that "x: PRIM" -> "typeof x === 'prim'"!
function getPrimitiveTypeCheck<PRIM>(prim: Primitive) {
	return checkerToGuard<unknown, PRIM>((input: unknown) => {
		if (typeof input !== prim) throw new Error(`not a ${prim}`);
		return `a ${prim}`;
	});
}

export const isNumber = getPrimitiveTypeCheck<number>('number');
export const isString = getPrimitiveTypeCheck<string>('string');
export const isBoolean = getPrimitiveTypeCheck<boolean>('boolean');
export const isFunction = getPrimitiveTypeCheck<Function>('function');
export const isSymbol = getPrimitiveTypeCheck<Symbol>('symbol');
export const isBigInt = getPrimitiveTypeCheck<BigInt>('bigint');

type StringValuesOf<T> = T extends string ? T : never;
type ArrayToLiteral<T, K extends keyof T = keyof T> = {[P in K]: StringValuesOf<T[P]>}[K];
type Boolsy<T extends string> = {[P in T]: boolean};
type LiteralCheck<T1 extends string, T2 extends string, BAD = unknown> =
	Boolsy<T1> extends Boolsy<T2> ? (Boolsy<T2> extends Boolsy<T1> ? T1 : BAD) : BAD;
export type ArrayLiteralCheck<T extends string, TT> = LiteralCheck<T, ArrayToLiteral<TT>>;

/**
 * Check that a value is a string literal type given the list of values.
 * CAUTION: this will NOT protect you from forgetting to list all the values of `T` in the parameter!
 *
 * @param keys Values to check
 */
export function isStringLiteral<T extends string, U extends T>(
	keys: ReadonlyArray<U>
): ReasonGuard<unknown, ArrayLiteralCheck<T, typeof keys>> {
	// want this to be computed once when building the guard
	const values = new Set<string>(keys);
	const litGuard = checkerToGuard((x: string): string => {
		if (values.has(x)) {
			return `is ${x}`;
		} else {
			throw new Error(`not in ${keys}`);
		}
	});
	// have to `as any` the literal guard here because `ArrayLiteralCheck<T, typeof keys>` might evaluate to `never`
	// if it does, the caller is going to end up with a compiler error and so the fact that the typing here went weird
	// should be a non-issue
	return thenGuard<unknown, unknown, ArrayLiteralCheck<T, typeof keys>>(isString, litGuard as any);
};

type _L = 'a' | 'b';
const k = ['a'] as const;
type _k = ArrayToLiteral<typeof k>;
type _kc = LiteralCheck<_L, _k>;
type _K = ArrayLiteralCheck<_L, typeof k>;
