import {ReasonGuard} from './ReasonGuard';

export type Checker<FROM> = (input: FROM) => string;

export const checkerToGuard = <(<FROM, TO extends FROM>(checker: Checker<FROM>) =>
	ReasonGuard<FROM, TO>)>((checker) => (input, e, c) => {
		try {
			c.push(checker(input));
			return true;
		} catch (err) {
			e.push(err);
			return false;
		}
	});
