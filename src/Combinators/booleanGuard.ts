import { buildNegatableDirect, makeNegatable, NegatableGuard } from '../NegatableGuard';
import { ErrorLike, errorLike, ReasonGuard } from '../ReasonGuard';

export function orGuard<FROM, LEFT extends FROM, RIGHT extends FROM>(
	left: ReasonGuard<FROM, LEFT>,
	right: ReasonGuard<FROM, RIGHT>,
): NegatableGuard<FROM, LEFT | RIGHT, FROM> {
	const leftNeg = makeNegatable(left);
	const rightNeg = makeNegatable(right);
	const raw = getRawOr(leftNeg, rightNeg);
	const rawNeg = getRawAnd(leftNeg.negate(), rightNeg.negate());
	return buildNegatableDirect(raw, rawNeg);
}

export function andGuard<FROM, LEFT extends FROM, RIGHT extends FROM>(
	left: ReasonGuard<FROM, LEFT>,
	right: ReasonGuard<FROM, RIGHT>,
): NegatableGuard<FROM, LEFT & RIGHT, FROM> {
	const leftNeg = makeNegatable(left);
	const rightNeg = makeNegatable(right);
	const raw = getRawAnd(leftNeg, rightNeg);
	const rawNeg = getRawOr(leftNeg.negate(), rightNeg.negate());
	return buildNegatableDirect(raw, rawNeg);
}

export function getRawAnd<FROM, LEFT extends FROM, RIGHT extends FROM>(
	left: ReasonGuard<FROM, LEFT>,
	right: ReasonGuard<FROM, RIGHT>,
): ReasonGuard<FROM, LEFT & RIGHT> {
	return (input, output, confirmations): input is LEFT & RIGHT => {
		return left(input, output, confirmations) && right(input, output, confirmations);
	};
}

export function getRawOr<FROM, LEFT extends FROM, RIGHT extends FROM>(
	left: ReasonGuard<FROM, LEFT>,
	right: ReasonGuard<FROM, RIGHT>,
): ReasonGuard<FROM, LEFT | RIGHT> {
	return (input, errors, confirmations): input is LEFT | RIGHT => {
		try {
			const innerErrors: ErrorLike[] = [];
			const innerConfirmations: string[] = [];
			if (left(input, innerErrors, innerConfirmations)) {
				confirmations?.push(...innerConfirmations);
				return true;
			}
			innerErrors.splice(1);
			innerConfirmations.splice(0);
			if (right(input, innerErrors, innerConfirmations)) {
				confirmations?.push(...innerConfirmations);
				return true;
			}
			errors?.push(errorLike(`${innerErrors[0].message}, and ${innerErrors[1].message}`));
			return false;
		} catch (err: any) {
			errors?.push(err);
			return false;
		}
	};
}
