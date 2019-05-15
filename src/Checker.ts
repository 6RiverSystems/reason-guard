import {ReasonGuard} from './ReasonGuard';
import {NegatableGuard} from './NegatableGuard';

export type Checker<FROM> = (input: FROM) => string;

export const checkerToGuard: <FROM, TO extends FROM, N extends FROM = FROM>(
	checker: Checker<FROM>
) => NegatableGuard<FROM, TO, N> = getGuard;

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

function getGuard<FROM, TO extends FROM, N extends FROM = FROM>(
	checker: Checker<FROM>
): NegatableGuard<FROM, TO, N> {
	return Object.assign(getRawGuard<FROM, TO>(checker), {negate: () => getNegation<FROM, TO, N>(checker)});
}

function getNegation<FROM, TO extends FROM, N extends FROM = FROM>(
	checker: Checker<FROM>
): NegatableGuard<FROM, N, TO> {
	return Object.assign(getRawNegation<FROM, N>(checker), {negate: () => getGuard<FROM, TO, N>(checker)});
}

