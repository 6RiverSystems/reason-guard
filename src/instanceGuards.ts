import { checkerToGuard } from './Checker';
import { errorLike } from './ReasonGuard';

export const getInstanceTypeCheck = <INST>(ctor: new (...args: any[]) => INST) =>
	checkerToGuard<unknown, INST>((input: unknown) => {
		if (!(input instanceof ctor)) {
			return errorLike(`not a ${ctor.name}`);
		}
		return `a ${ctor.name}`;
	});

export const isDate = getInstanceTypeCheck(Date);
export const isArray = getInstanceTypeCheck(Array);
