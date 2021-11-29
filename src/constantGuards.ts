import { checkerToGuard } from './Checker';
import { NegatableGuard } from './NegatableGuard';
import { errorLike, ReasonGuard } from './ReasonGuard';

const trueGuard: NegatableGuard<unknown, unknown, never> = checkerToGuard(() => 'true');

const falseGuard: NegatableGuard<unknown, never, unknown> = checkerToGuard(() => {
	return errorLike('false');
});

export const constantGuards: (result: boolean) => NegatableGuard<unknown, unknown, unknown> = (
	result: boolean,
) => (result ? trueGuard : falseGuard);

const unnegatableTrueGuard: ReasonGuard<unknown, unknown> = (
	input,
	errors,
	confirmations,
): input is unknown => {
	confirmations?.push('true');
	return true;
};

const unnegatableFalseGuard: ReasonGuard<unknown, never> = (input, errors): input is never => {
	errors?.push(errorLike('false'));
	return false;
};

export const unnegatableConstantGuards: (result: boolean) => ReasonGuard<unknown, unknown> = (
	result,
) => (result ? unnegatableTrueGuard : unnegatableFalseGuard);
