import { ReasonGuard } from '../ReasonGuard';
import { orGuard } from './orGuard';
import { notGuard } from './notGuard';
import { buildNegatable } from '../NegatableGuard';

export const thenGuard = <FROM, MID extends FROM, TO extends MID>(
	left: ReasonGuard<FROM, MID>,
	right: ReasonGuard<MID, TO>,
) =>
	buildNegatable(
		() => getRawThen(left, right),
		() => getRawNegatedThen(left, right),
	);

function getRawThen<FROM, MID extends FROM, TO extends MID>(
	left: ReasonGuard<FROM, MID>,
	right: ReasonGuard<MID, TO>,
): ReasonGuard<FROM, TO> {
	return (input, output, confirmations, context): input is TO => {
		return (
			left(input, output, confirmations, context) && right(input, output, confirmations, context)
		);
	};
}

function getRawNegatedThen<FROM, MID extends FROM, TO extends MID>(
	left: ReasonGuard<FROM, MID>,
	right: ReasonGuard<MID, TO>,
): ReasonGuard<FROM, FROM> {
	return orGuard(getRawThen(left, notGuard<MID, MID>(right)), notGuard(left));
}
