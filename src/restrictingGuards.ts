import { checkerToGuard } from './Checker';
import { andGuard, orGuard, thenGuard } from './Combinators';
import { errorLike, ReasonGuard } from './ReasonGuard';
import { isDate } from './instanceGuards';
import { isDateString } from './parseGuards';
import { isNumber, isSymbol, isString } from './primitiveGuards';

export const isDateOrDateString = orGuard(thenGuard(isString, isDateString), isDate);

// TODO investigate non-regex pattern checks
const UUIDRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const isUUIDString = checkerToGuard<string, string>((input) => {
	if (UUIDRegex.test(input)) {
		return 'Valid UUID';
	} else {
		return errorLike('Not a valid UUID');
	}
});

export const isUUID = thenGuard(isString, isUUIDString);

export const numberIsInteger = checkerToGuard<number, number>((input: number) => {
	if (!Number.isInteger(input)) {
		return errorLike(`${input} is not an integer`);
	}
	return `${input} is an integer`;
});

export const numberIsFinite = checkerToGuard<number, number>((input: number) => {
	if (!Number.isFinite(input)) {
		return errorLike(`${input} is not finite`);
	}
	return `${input} is finite`;
});

export const numberIsLessThan = (maximum: number) =>
	checkerToGuard<number, number>((input: number) => {
		if (input < maximum) {
			return `${input} < ${maximum}`;
		}
		return errorLike(`${input} >= ${maximum}`);
	});

export const numberIsGreaterThan = (minimum: number) =>
	checkerToGuard<number, number>((input: number) => {
		if (input > minimum) {
			return `${input} > ${minimum}`;
		}
		return errorLike(`${input} <= ${minimum}`);
	});

export const numberIs = (value: number) =>
	Number.isNaN(value)
		? checkerToGuard<number, number>((input: number) => {
				if (Number.isNaN(input)) {
					return `${input} = ${value}`;
				}
				return errorLike(`${input} != ${value}`);
		  })
		: checkerToGuard<number, number>((input: number) => {
				if (input === value) {
					return `${input} = ${value}`;
				}
				return errorLike(`${input} != ${value}`);
		  });
export const numberIsAtMost = (maximum: number) =>
	orGuard(numberIsLessThan(maximum), numberIs(maximum));

export const numberIsAtLeast = (minimum: number) =>
	orGuard(numberIsGreaterThan(minimum), numberIs(minimum));

export const numberIsLessThanOrEqual = numberIsAtMost;
export const numberIsGreaterThanOrEqual = numberIsAtLeast;

const OPEN = Symbol('open');
const CLOSED = Symbol('closed');

const bottomSymbols = {
	'>': OPEN,
	open: OPEN,
	'(': OPEN,
	gt: OPEN,
	GT: OPEN,
	'>=': CLOSED,
	closed: CLOSED,
	'[': CLOSED,
	gte: CLOSED,
	GTE: CLOSED,
};

const topSymbols = {
	'<': OPEN,
	open: OPEN,
	')': OPEN,
	lt: OPEN,
	LT: OPEN,
	'<=': CLOSED,
	closed: CLOSED,
	']': CLOSED,
	lte: CLOSED,
	LTE: CLOSED,
};

export type Bottom = keyof typeof bottomSymbols;
export type Top = keyof typeof topSymbols;

export const interval =
	(bottomType: Bottom, bottomValue: number) => (topValue: number, topType: Top) =>
		thenGuard(
			isNumber,
			andGuard(
				bottomSymbols[bottomType] === OPEN
					? numberIsGreaterThan(bottomValue)
					: numberIsAtLeast(bottomValue),
				topSymbols[topType] === OPEN ? numberIsLessThan(topValue) : numberIsAtMost(topValue),
			),
		);

export const integralInterval =
	(bottomType: Bottom, bottomValue: number) => (topValue: number, topType: Top) =>
		thenGuard(interval(bottomType, bottomValue)(topValue, topType), numberIsInteger);

export const numberIsSafeInteger = andGuard(
	numberIsInteger,
	interval('>=', Number.MIN_SAFE_INTEGER)(Number.MAX_SAFE_INTEGER, '<='),
);

export function isStrictEqual<T>(value: T) {
	const confirmation = `is exactly ${String(value)}`;
	const error = errorLike(`is not exactly ${String(value)}`);
	return checkerToGuard<unknown, T>((input) => {
		// have to use String() because of Symbols
		if (value === input) {
			return confirmation;
		} else {
			return error;
		}
	});
}

// You can have boolean literal types, but they don't work with Record<>,
// and they don't make sense in most contexts, so they are handled separately
type Literable = string | symbol | number;

type ArrayToLiteral<T> = T extends ReadonlyArray<infer U> ? U : never;
type BoolMap<T extends Literable> = Record<T, boolean>;
type LiteralCheck<
	T1 extends Literable,
	T2 extends Literable,
	BAD = unknown,
> = BoolMap<T1> extends BoolMap<T2> ? (BoolMap<T2> extends BoolMap<T1> ? T2 : BAD) : BAD;
export type ArrayLiteralCheck<
	T extends Literable,
	TT extends ReadonlyArray<Literable>,
> = LiteralCheck<T, ArrayToLiteral<TT>>;

export const isLiterable = orGuard(orGuard(isString, isSymbol), isNumber);

/**
 * Check that a value is a string literal type given the list of values.
 *
 * @param keys Values to check
 */
export function isLiteral<T extends Literable, U extends T>(
	keys: ReadonlyArray<U>,
	literableGuard: ReasonGuard<unknown, Literable> = isLiterable,
): ReasonGuard<unknown, ArrayLiteralCheck<T, typeof keys>> {
	// want this to be computed once when building the guard
	const values = new Set<Literable>(keys);

	return (input, errors, confirmations): input is ArrayLiteralCheck<T, typeof keys> => {
		try {
			if (!literableGuard(input, errors, confirmations)) {
				return false;
			}
			if (values.has(input)) {
				confirmations?.push(`is ${String(input)}`);
				return true;
			} else {
				errors?.push(errorLike(`not in ${keys.map((k) => String(k))}`));
				return false;
			}
		} catch (err: any) {
			errors?.push(err);
			return false;
		}
	};
}

const isNonEmptyStringChecker = checkerToGuard<string, string>((input: string) => {
	if (input.length === 0) {
		return errorLike('String is has length of 0');
	}
	return `${input} is non-empty string`;
});

export const isNonEmptyString = thenGuard(isString, isNonEmptyStringChecker);
