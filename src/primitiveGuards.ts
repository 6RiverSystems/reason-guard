import {checkerToGuard} from './Checker';
import {ReasonGuard} from './ReasonGuard';
import {orGuard} from './combinators';

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

type Literable = string | symbol | number;

type ArrayToLiteral<T> = T extends ReadonlyArray<infer U> ? U : never;
type BoolMap<T extends Literable> = {[P in T]: boolean};
type LiteralCheck<T1 extends Literable, T2 extends Literable, BAD = unknown> =
	BoolMap<T1> extends BoolMap<T2> ? (BoolMap<T2> extends BoolMap<T1> ? T1 : BAD) : BAD;
export type ArrayLiteralCheck<T extends Literable, TT extends ReadonlyArray<Literable>> =
	LiteralCheck<T, ArrayToLiteral<TT>>;

export const isLiterable = orGuard<unknown, Literable>(
	orGuard<unknown, string|symbol>(
		isString,
		isSymbol
	),
	isNumber
);

/**
 * Check that a value is a string literal type given the list of values.
 * CAUTION: this will NOT protect you from forgetting to list all the values of `T` in the parameter!
 *
 * @param keys Values to check
 */
export function isLiteral<T extends Literable, U extends T>(
	keys: ReadonlyArray<U>,
	literableGuard: ReasonGuard<unknown, Literable> = isLiterable
): ReasonGuard<unknown, ArrayLiteralCheck<T, typeof keys>> {
	// want this to be computed once when building the guard
	const values = new Set<Literable>(keys);

	return (input, es, cs): input is ArrayLiteralCheck<T, typeof keys> => {
		try {
			if (!literableGuard(input, es, cs)) {
				return false;
			}
			if (values.has(input)) {
				cs.push(`is ${String(input)}`);
				return true;
			} else {
				throw new Error(`not in ${keys}`);
			}
		} catch (err) {
			es.push(err);
			return false;
		}
	};
};
