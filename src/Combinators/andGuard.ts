import { notGuard } from './notGuard';
import { orGuard } from './orGuard';
import { buildNegatable } from '../NegatableGuard';
import { ReasonGuard } from '../ReasonGuard';

export const andGuard = <FROM, LEFT extends FROM, RIGHT extends FROM>(
	left: ReasonGuard<FROM, LEFT>,
	right: ReasonGuard<FROM, RIGHT>,
) =>
	buildNegatable(
		() => getRawAnd(left, right),
		() => getRawNegatedAnd(left, right),
	);

function getRawAnd<FROM, LEFT extends FROM, RIGHT extends FROM>(
	left: ReasonGuard<FROM, LEFT>,
	right: ReasonGuard<FROM, RIGHT>,
): ReasonGuard<FROM, LEFT & RIGHT> {
	return (input, output, confirmations): input is LEFT & RIGHT => {
		return left(input, output, confirmations) && right(input, output, confirmations);
	};
}

function getRawNegatedAnd<FROM, LEFT extends FROM, RIGHT extends FROM>(
	left: ReasonGuard<FROM, LEFT>,
	right: ReasonGuard<FROM, RIGHT>,
): ReasonGuard<FROM, FROM> {
	return orGuard(notGuard(right), notGuard(left));
}
