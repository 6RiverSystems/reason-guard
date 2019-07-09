import {ReasonGuard} from './ReasonGuard';
import {NegatableGuard, buildNegatable} from './NegatableGuard';
import {thenGuard} from './Combinators';
import {isString} from './primitiveGuards';

export type Checker<FROM> = (input: FROM) => string;

export const checkerToGuard: <FROM, TO extends FROM, N extends FROM = FROM>(
	checker: Checker<FROM>
	) => NegatableGuard<FROM, TO, N> = (checker) => buildNegatable(
		() => getRawGuard(checker),
		() => getRawNegation(checker)
	);

const uuidChecker = (input: string) => {
	if (!!input
			&& /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/.test(input)
	) {
		return 'Valid UUID';
	} else {
		throw new Error('Not a valid UUID');
	}
};

const isUUIDString = checkerToGuard(uuidChecker);

export const isUUID = thenGuard(isString, isUUIDString);

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
