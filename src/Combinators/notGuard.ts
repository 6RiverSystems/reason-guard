import {ReasonGuard} from '../ReasonGuard';
import {isNegatableGuard, NegatableGuard, buildNegatable} from '../NegatableGuard';

export const notGuard =
	<FROM, TO extends FROM, N extends FROM = FROM>
	(inner: ReasonGuard<FROM, TO>|NegatableGuard<FROM, TO, N>) =>
		isNegatableGuard(inner)
			? inner.negate()
			: buildNegatable(
				() => getRawNot(inner),
				() => inner
			);

function getRawNot<FROM, TO extends FROM>(
	inner: ReasonGuard<FROM, TO>
): ReasonGuard<FROM, FROM> {
	return (input: FROM, errors: Error[] = [], confirmations: string[] = []): input is FROM => {
		try {
			const innerErrors: Error[] = [];
			const innerConfs: string[] = [];
			if (inner(input, innerErrors, innerConfs)) {
				throw new Error(innerConfs[innerConfs.length-1]);
			} else {
				confirmations.push(innerErrors[0].message);
				return true;
			}
		} catch (err) {
			errors.push(err);
			return false;
		}
	};
}
