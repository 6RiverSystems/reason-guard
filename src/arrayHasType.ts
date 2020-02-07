import {ReasonGuard} from './ReasonGuard';
import {checkerToGuard, pushContext} from './Checker';
import {thenGuard} from './Combinators';
import {isArray} from './instanceGuards';
import {NegatableGuard} from './NegatableGuard';
import {ContextError, CompositeError} from './ContextError';

export const arrayHasType =
	<TO>(itemGuard: ReasonGuard<unknown, TO>) =>
		checkerToGuard<unknown[], TO[]>((input: unknown[], context?: PropertyKey[]) => {
			for (let i = 0; i < input.length; i++) {
				const innerErrors: Error[] = [];
				const innerConfs: string[] = [];
				const innerContext = pushContext(i, context);
				if (!itemGuard(input[i], innerErrors, innerConfs, innerContext)) {
					throw new CompositeError(innerErrors.map((err) =>
						new ContextError(`element ${i}: ${err.message}`,
							err instanceof ContextError ? err.context : innerContext))
					);
				}
			}
			return `is array of expected type`;
		});

export const isArrayOfType =
<TO>(itemGuard: ReasonGuard<unknown, TO>): NegatableGuard<unknown, TO[], unknown> =>
		thenGuard(
			isArray,
			arrayHasType(itemGuard)
		);
