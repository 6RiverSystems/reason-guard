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

export function isStringLiteral<T extends string>(keys: {[P in T]: any}): ReasonGuard<unknown, T> {
	// want this to be computed once when building the guard
	const values = new Set(Object.getOwnPropertyNames(keys));
	return thenGuard(isString, checkerToGuard((x: string): string => {
		if (values.has(x)) {
			return `is ${x}`;
		} else {
			throw new Error(`not in ${[...values.values()]}`);
		}
	}));
};
