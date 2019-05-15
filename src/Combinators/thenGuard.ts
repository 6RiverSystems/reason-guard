import {ReasonGuard} from '../ReasonGuard';
import {orGuard} from './orGuard';
import {notGuard} from './notGuard';

export const thenGuard = getThenGuard;
export const andGuard = thenGuard;

function getRawThen<FROM, MID extends FROM, TO extends MID>(
	left: ReasonGuard<FROM, MID>,
	right: ReasonGuard<MID, TO>
): ReasonGuard<FROM, TO> {
	return (input, output, confirmations): input is TO => {
		return left(input, output, confirmations) && right(input, output, confirmations);
	};
}

function getRawNegatedThen<FROM, MID extends FROM, TO extends MID>(
	left: ReasonGuard<FROM, MID>,
	right: ReasonGuard<MID, TO>
): ReasonGuard<FROM, FROM> {
	return orGuard(
		getRawThen(left, notGuard<MID, MID>(right)),
		notGuard(left)
	);
}

function getThenGuard<FROM, MID extends FROM, TO extends MID>(
	left: ReasonGuard<FROM, MID>,
	right: ReasonGuard<MID, TO>
) {
	return Object.assign(getRawThen(left, right), {negate: () => getNegatedThenGuard(left, right)});
}

function getNegatedThenGuard<FROM, MID extends FROM, TO extends MID>(
	left: ReasonGuard<FROM, MID>,
	right: ReasonGuard<MID, TO>
) {
	return Object.assign(getRawNegatedThen(left, right), {negate: () => getThenGuard(left, right)});
}
