import assert = require('assert');

import { ErrorLike, ReasonGuard, errorLike } from './ReasonGuard';

export type NegatableGuard<FROM, TO extends FROM, N extends FROM = FROM> = ReasonGuard<FROM, TO> & {
	negate: () => NegatableGuard<FROM, N, TO>;
};

export type AlternativeGuard<LEFT, RIGHT> = NegatableGuard<LEFT | RIGHT, LEFT, RIGHT>;

export const isNegatableGuard = <FROM, TO extends FROM, N extends FROM = FROM>(
	input: ReasonGuard<FROM, TO> | NegatableGuard<FROM, TO, N>,
): input is NegatableGuard<FROM, TO, N> =>
	typeof input === 'function' && typeof (input as any).negate === 'function';

/**
 * @deprecated This function requires either GC thrash or risks infinite loops
 * creating guards. Use `buildNegatableDirect` instead
 */
export const buildNegatable = <FROM, TO extends FROM, N extends FROM = FROM>(
	input: () => ReasonGuard<FROM, TO>,
	negated: () => ReasonGuard<FROM, N>,
): NegatableGuard<FROM, TO, N> => {
	return buildNegatableDirect(input(), negated());
};

export const buildNegatableDirect = <FROM, TO extends FROM, N extends FROM = FROM>(
	input: ReasonGuard<FROM, TO>,
	negated: ReasonGuard<FROM, N>,
): NegatableGuard<FROM, TO, N> => {
	assert(!('negate' in input));
	assert(!('negate' in negated));
	Object.assign(negated, { negate: () => input });
	Object.assign(input, { negate: () => negated });
	// TS doesn't understand how we have changed the types
	return input as NegatableGuard<FROM, TO, N>;
};

/**
 * `makeNegatable` checks if `input` is negatable, and makes it so if it isn't.
 * It always returns `input`, possibly after modifying it.
 */
export const makeNegatable = <FROM, TO extends FROM, N extends FROM = FROM>(
	input: ReasonGuard<FROM, TO>,
): NegatableGuard<FROM, TO, N> =>
	isNegatableGuard<FROM, TO, N>(input) ? input : buildNegatableDirect(input, negate(input));

export function negate<FROM, TO extends FROM, N extends FROM>(
	inner: ReasonGuard<FROM, TO>,
): ReasonGuard<FROM, N> {
	return (input: FROM, errors?: ErrorLike[], confirmations?: string[]): input is N => {
		try {
			let innerErrors: ErrorLike[] | undefined;
			let innerConfirmations: string[] | undefined;
			if (confirmations) {
				innerErrors = [];
			}
			if (errors) {
				innerConfirmations = [];
			}
			if (inner(input, innerErrors, innerConfirmations)) {
				if (innerConfirmations) {
					errors?.push(errorLike(innerConfirmations[innerConfirmations.length - 1]));
				}
				return false;
			} else {
				if (innerErrors) {
					confirmations?.push(innerErrors[0].message);
				}
				return true;
			}
		} catch (err: any) {
			errors?.push(err);
			return false;
		}
	};
}
