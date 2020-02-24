import { ReasonGuard } from '../ReasonGuard';
import { notGuard } from './notGuard';
import { buildNegatable } from '../NegatableGuard';
import { andGuard } from './andGuard';

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
	return (input, output = [], confirmations = []): input is LEFT | RIGHT => {
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
	right: ReasonGuard<FROM, RIGHT>,
): ReasonGuard<FROM, FROM> {
	return andGuard(notGuard(left), notGuard(right));
}
