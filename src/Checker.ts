import { CompositeError } from './ContextError';
import { NegatableGuard, buildNegatableDirect } from './NegatableGuard';
import { errorLike, ErrorLike, ReasonGuard } from './ReasonGuard';

export type Checker<FROM> = (input: FROM, context?: PropertyKey[]) => string | ErrorLike;

export const checkerToGuard: <FROM, TO extends FROM, N extends FROM = FROM>(
	checker: Checker<FROM>,
) => NegatableGuard<FROM, TO, N> = (checker) =>
	buildNegatableDirect(getRawGuard(checker), getRawNegation(checker));

function getRawGuard<FROM, TO extends FROM>(checker: Checker<FROM>): ReasonGuard<FROM, TO> {
	return (input, errors, confirmations, context = []): input is TO => {
		let result: string | ErrorLike;
		try {
			result = checker(input, context);
			if (typeof result === 'string') {
				confirmations?.push(result);
				return true;
			}
		} catch (err: any) {
			result = err;
		}
		if (result instanceof CompositeError) {
			errors?.push(...result.errors);
		} else {
			// can't get here if we got a positive confirmation
			errors?.push(result as ErrorLike);
		}
		return false;
	};
}

function getRawNegation<FROM, TO extends FROM>(checker: Checker<FROM>): ReasonGuard<FROM, TO> {
	return (input, errors, confirmations, context = []): input is TO => {
		let result: string | ErrorLike;
		try {
			result = checker(input, context);
			if (typeof result === 'string') {
				errors?.push(errorLike(`negation of: ${result}`));
				return false;
			}
		} catch (err: any) {
			result = err;
		}
		// can't get here if we got a positive inner confirmation
		confirmations?.push((result as ErrorLike).message);
		return true;
	};
}

export function pushContext<T extends PropertyKey>(p: T, context?: PropertyKey[]): PropertyKey[] {
	if (context) {
		return [...context, p];
	} else {
		return [p];
	}
}
