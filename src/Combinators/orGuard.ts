import { andGuard } from './andGuard';
import { notGuard } from './notGuard';
import { buildNegatable } from '../NegatableGuard';
import { ErrorLike, errorLike, ReasonGuard } from '../ReasonGuard';

export const orGuard = <FROM, LEFT extends FROM, RIGHT extends FROM>(
	left: ReasonGuard<FROM, LEFT>,
	right: ReasonGuard<FROM, RIGHT>,
) =>
	buildNegatable(
		() => getRawOr(left, right),
		() => getRawNegatedOr(left, right),
	);

function getRawOr<FROM, LEFT extends FROM, RIGHT extends FROM>(
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

function getRawNegatedOr<FROM, LEFT extends FROM, RIGHT extends FROM>(
	left: ReasonGuard<FROM, LEFT>,
	right: ReasonGuard<FROM, RIGHT>,
): ReasonGuard<FROM, FROM> {
	return andGuard(notGuard(left), notGuard(right));
}
