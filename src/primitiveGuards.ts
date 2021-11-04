import { checkerToGuard } from './Checker';
import { andGuard, notGuard } from './Combinators';

type Primitive =
	| 'string'
	| 'number'
	| 'bigint'
	| 'boolean'
	| 'symbol'
	| 'undefined'
	| 'object'
	| 'function';
// Dangerous -- do not export!
// We cannot guarantee that "x: PRIM" -> "typeof x === 'prim'"!
function getPrimitiveTypeCheck<PRIM>(prim: Primitive) {
	return checkerToGuard<unknown, PRIM>((input: unknown) => {
		if (typeof input !== prim) throw new Error(`not a ${prim}`);
		return `a ${prim}`;
	});
}

export const isUndefined = checkerToGuard<unknown, undefined>((input) => {
	if (input === undefined) {
		return `undefined`;
	}
	throw new Error('not undefined');
});
export const isNull = checkerToGuard<unknown, null>((input) => {
	if (input === null) {
		return `null`;
	}
	throw new Error('not null');
});

export const isNumber = getPrimitiveTypeCheck<number>('number');
export const isString = getPrimitiveTypeCheck<string>('string');
export const isBoolean = getPrimitiveTypeCheck<boolean>('boolean');
// eslint-disable-next-line @typescript-eslint/ban-types
export const isFunction = getPrimitiveTypeCheck<Function>('function');
export const isSymbol = getPrimitiveTypeCheck<symbol>('symbol');
export const isBigInt = getPrimitiveTypeCheck<BigInt>('bigint');
export const isObject = andGuard(getPrimitiveTypeCheck<object>('object'), notGuard(isNull));
