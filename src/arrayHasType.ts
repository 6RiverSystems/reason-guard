import { checkerToGuard, pushContext } from './Checker';
import { thenGuard } from './Combinators';
import { ContextError, CompositeError } from './ContextError';
import { NegatableGuard } from './NegatableGuard';
import { ErrorLike, ReasonGuard } from './ReasonGuard';
import { isArray } from './instanceGuards';

const arrayHasTypeConfirmation = 'is array of expected type';
export const arrayHasType = <TO>(itemGuard: ReasonGuard<unknown, TO>) =>
	checkerToGuard<unknown[], TO[]>((input: unknown[], context?: PropertyKey[]) => {
		for (let i = 0; i < input.length; i++) {
			const innerErrors: ErrorLike[] = [];
			const innerConfirmations: string[] = [];
			const innerContext = pushContext(i, context);
			if (!itemGuard(input[i], innerErrors, innerConfirmations, innerContext)) {
				return new CompositeError(
					innerErrors.map(
						(err) =>
							new ContextError(
								`element ${i}: ${err.message}`,
								err instanceof ContextError ? err.context : innerContext,
							),
					),
				);
			}
		}
		return arrayHasTypeConfirmation;
	});

export const isArrayOfType = <TO>(
	itemGuard: ReasonGuard<unknown, TO>,
): NegatableGuard<unknown, TO[], unknown> => thenGuard(isArray, arrayHasType(itemGuard));
