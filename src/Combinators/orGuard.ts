import {ReasonGuard} from '../ReasonGuard';
import {andGuard} from './thenGuard';
import {notGuard} from './notGuard';

export const orGuard = getOrGuard;

function getRawOr<FROM, LEFT extends FROM, RIGHT extends FROM>(
	left: ReasonGuard<FROM, LEFT>,
	right: ReasonGuard<FROM, RIGHT>
): ReasonGuard<FROM, LEFT|RIGHT> {
	return (input, output = [], confirmations = []): input is LEFT|RIGHT => {
		try {
			const innerErrors: Error[] = [];
			const innerConfs: string[] = [];
			if (left(input, innerErrors, innerConfs)) {
				confirmations.push(...innerConfs);
				return true;
			}
			innerErrors.splice(1);
			innerConfs.splice(0);
			if (right(input, innerErrors, innerConfs)) {
				confirmations.push(...innerConfs);
				return true;
			}
			throw new Error(`${innerErrors[0].message}, and ${innerErrors[1].message}`);
		} catch (err) {
			output.push(err);
			return false;
		}
	};
}

function getRawNegatedOr<FROM, LEFT extends FROM, RIGHT extends FROM>(
	left: ReasonGuard<FROM, LEFT>,
	right: ReasonGuard<FROM, RIGHT>
): ReasonGuard<FROM, FROM> {
	return andGuard(notGuard(left), notGuard(right));
}

function getOrGuard<FROM, LEFT extends FROM, RIGHT extends FROM>(
	left: ReasonGuard<FROM, LEFT>,
	right: ReasonGuard<FROM, RIGHT>
) {
	return Object.assign(getRawOr(left, right), {negate: () => getNegatedOrGuard(left, right)});
}

function getNegatedOrGuard<FROM, LEFT extends FROM, RIGHT extends FROM>(
	left: ReasonGuard<FROM, LEFT>,
	right: ReasonGuard<FROM, RIGHT>
) {
	return Object.assign(getRawNegatedOr(left, right), {negate: () => getOrGuard(left, right)});
}
