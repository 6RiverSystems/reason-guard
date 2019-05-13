import {checkerToGuard} from './Checker';
import {thenGuard, andGuard, orGuard} from './combinators';
import {ReasonGuard} from './ReasonGuard';
import {isNumber, isSymbol, isString} from './primitiveGuards';

export const numberIsInteger = checkerToGuard<number, number>((input: number) => {
	if (!Number.isInteger(input)) {
		throw new Error(`${input} is not an integer`);
	}
	return `${input} is an integer`;
});

export const numberIsLessThan = (maximum: number) =>
	checkerToGuard<number, number>((input: number) => {
		if (input >= maximum) {
			throw new Error(`${input} >= ${maximum}`);
		}
		return `${input} < ${maximum}`;
	});

export const numberIsGreaterThan = (minimum: number) =>
	checkerToGuard<number, number>((input: number) => {
		if (input <= minimum) {
			throw new Error(`${input} <= ${minimum}`);
		}
		return `${input} > ${minimum}`;
	});

export const numberIsAtMost = (maximum: number) =>
	checkerToGuard<number, number>((input: number) => {
		if (input > maximum) {
			throw new Error(`${input} > ${maximum}`);
		}
		return `${input} <= ${maximum}`;
	});

export const numberIsAtLeast = (minimum: number) =>
	checkerToGuard<number, number>((input: number) => {
		if (input < minimum) {
			throw new Error(`${input} < ${minimum}`);
		}
		return `${input} >= ${minimum}`;
	});

export const openIntegerRange =
	(minimum: number, maximum: number) =>
		thenGuard(
			numberIsInteger,
			andGuard(numberIsAtLeast(minimum), numberIsAtMost(maximum))
		);

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
