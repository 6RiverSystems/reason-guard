import {ReasonGuard} from '../ReasonGuard';
import {isNegatableGuard} from '../NegatableGuard';

export const notGuard =
	<(<FROM, TO extends FROM>(inner: ReasonGuard<FROM, TO>) =>
		ReasonGuard<FROM, FROM>)>((inner) => {
			if (isNegatableGuard(inner)) {
				return inner.negate();
			}
			return (input, errors = [], confirmations = []) => {
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
		});
