import {checkerToGuard} from './Checker';

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
export const isSymbol = getPrimitiveTypeCheck<symbol>('symbol');
export const isBigInt = getPrimitiveTypeCheck<BigInt>('bigint');
export const isObject = getPrimitiveTypeCheck<Object>('object');
