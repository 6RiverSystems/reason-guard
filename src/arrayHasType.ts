import {ReasonGuard} from './ReasonGuard';
import {checkerToGuard} from './Checker';
import {thenGuard} from './Combinators';
import {isArray} from './instanceGuards';
import {NegatableGuard} from './NegatableGuard';

export const arrayHasType =
	<TO>(itemGuard: ReasonGuard<unknown, TO>) =>
		checkerToGuard<unknown[], TO[]>((input: unknown[]) => {
			for (let i = 0; i < input.length; i++) {
				const innerErrors: Error[] = [];
				const innerConfs: string[] = [];
				if (!itemGuard(input[i], innerErrors, innerConfs)) {
					throw new Error(`element ${i}: ${innerErrors[0].message}`);
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
