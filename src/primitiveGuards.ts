import { checkerToGuard } from './Checker';
import { andGuard, notGuard } from './Combinators';
import { errorLike } from './ReasonGuard';

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
	// avoid reconstructing messages on every hit
	const confirmation = `a ${prim}`;
	const error = errorLike(`not a ${prim}`);
	return checkerToGuard<unknown, PRIM>((input: unknown) => {
		if (typeof input !== prim) {
			return error;
		}
		return confirmation;
	});
}

// more error construction optimization
const isUndefinedConfirmation = 'undefined';
const isUndefinedError = errorLike('not undefined');
export const isUndefined = checkerToGuard<unknown, undefined>((input) => {
	if (input === undefined) {
		return isUndefinedConfirmation;
	}
	return isUndefinedError;
});
const isNullConfirmation = 'null';
const isNullError = errorLike('not null');
export const isNull = checkerToGuard<unknown, null>((input) => {
	if (input === null) {
		return isNullConfirmation;
	}
	return isNullError;
});

export const isNumber = getPrimitiveTypeCheck<number>('number');
export const isString = getPrimitiveTypeCheck<string>('string');
export const isBoolean = getPrimitiveTypeCheck<boolean>('boolean');
// eslint-disable-next-line @typescript-eslint/ban-types
export const isFunction = getPrimitiveTypeCheck<Function>('function');
export const isSymbol = getPrimitiveTypeCheck<symbol>('symbol');
export const isBigInt = getPrimitiveTypeCheck<bigint>('bigint');
export const isObject = andGuard(getPrimitiveTypeCheck<object>('object'), notGuard(isNull));
