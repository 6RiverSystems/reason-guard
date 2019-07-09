import {ReasonGuard} from './ReasonGuard';
import {NegatableGuard, buildNegatable} from './NegatableGuard';

export type Checker<FROM> = (input: FROM) => string;

export const checkerToGuard: <FROM, TO extends FROM, N extends FROM = FROM>(
	checker: Checker<FROM>
) => NegatableGuard<FROM, TO, N> = (checker) => buildNegatable(
	() => getRawGuard(checker),
	() => getRawNegation(checker)
);

function getRawGuard<FROM, TO extends FROM>(checker: Checker<FROM>): ReasonGuard<FROM, TO> {
	return (input, e = [], c = []): input is TO => {
		try {
			c.push(checker(input));
			return true;
		} catch (err) {
			e.push(err);
			return false;
		}
	};
}

function getRawNegation<FROM, TO extends FROM>(checker: Checker<FROM>): ReasonGuard<FROM, TO> {
	return (input, e = [], c = []): input is TO => {
		try {
			const innerConf = checker(input);
			try {
				throw new Error(`negation of: ${innerConf}`);
			} catch (err) {
				e.push(err);
				return false;
			}
		} catch (err) {
			c.push(err.message);
			return true;
		}
	};
}
