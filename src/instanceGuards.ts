import { checkerToGuard } from './Checker';
import { errorLike } from './ReasonGuard';

export function getInstanceTypeCheck<INST>(ctor: new (...args: any[]) => INST) {
	const confirmation = `a ${ctor.name}`;
	const error = errorLike(`not a ${ctor.name}`);
	return checkerToGuard<unknown, INST>((input: unknown) => {
		if (!(input instanceof ctor)) {
			return error;
		}
		return confirmation;
	});
}

export const isDate = getInstanceTypeCheck(Date);
export const isArray = getInstanceTypeCheck(Array);
