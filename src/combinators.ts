import {ReasonGuard} from './ReasonGuard';

export const thenGuard =
	<(<FROM, MID extends FROM, TO extends MID>(left: ReasonGuard<FROM, MID>, right: ReasonGuard<MID, TO>) =>
		ReasonGuard<FROM, TO>)>((left, right) => {
			return (input, output, confirmations) => {
				return left(input, output, confirmations) && right(input, output, confirmations);
			};
		});

export const andGuard =
<(<FROM, LEFT extends FROM, RIGHT extends FROM>(left: ReasonGuard<FROM, LEFT>, right: ReasonGuard<FROM, RIGHT>) =>
ReasonGuard<FROM, LEFT&RIGHT>)>((left, right) => {
	return (input, output, confirmations) => {
		return left(input, output, confirmations) && right(input, output, confirmations);
	};
});

export const notGuard =
	<(<FROM, TO extends FROM>(inner: ReasonGuard<FROM, TO>) =>
		ReasonGuard<FROM, Exclude<FROM, TO>>)>((inner) => {
			return (input, output, confirmations) => {
				try {
					const innerErrors: Error[] = [];
					const innerConfs: string[] = [];
					if (inner(input, innerErrors, innerConfs)) {
						throw new Error(innerConfs[0]);
					} else {
						confirmations.push(innerErrors[0].message);
						return true;
					}
				} catch (err) {
					output.push(err);
					return false;
				}
			};
		});

export const orGuard =
	<(<FROM, TO extends FROM>(left: ReasonGuard<FROM, TO>, right: ReasonGuard<FROM, TO>) =>
	ReasonGuard<FROM, TO>)>((left, right) => {
		return (input, output, confirmations) => {
			try {
				const innerErrors: Error[] = [];
				const innerConfs: string[] = [];
				if (left(input, innerErrors, innerConfs)) {
					confirmations.push(innerConfs[0]);
					return true;
				}
				innerConfs.splice(0);
				if (right(input, innerErrors, innerConfs)) {
					confirmations.push(innerConfs[0]);
					return true;
				}
				throw new Error(`${innerErrors[0].message}, and ${innerErrors[1].message}`);
			} catch (err) {
				output.push(err);
				return false;
			}
		};
	});
