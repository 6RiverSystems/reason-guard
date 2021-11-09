import { checkerToGuard } from './Checker';
import { NegatableGuard } from './NegatableGuard';
import { ReasonGuard } from './ReasonGuard';

const trueGuard: NegatableGuard<unknown, unknown, never> = checkerToGuard(() => 'true');

const falseGuard: NegatableGuard<unknown, never, unknown> = checkerToGuard(() => {
	throw new Error('false');
});

export const constantGuards: (result: boolean) => NegatableGuard<unknown, unknown, unknown> = (
	result: boolean,
) => (result ? trueGuard : falseGuard);

const unnegatableTrueGuard: ReasonGuard<unknown, unknown> =
	// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
	(input, es = [], cs = []): input is unknown => {
		cs.push('true');
		return true;
	};

const unnegatableFalseGuard: ReasonGuard<unknown, never> = (input, es = []): input is never => {
	es.push(new Error('false'));
	return false;
};

export const unnegatableConstantGuards: (result: boolean) => ReasonGuard<unknown, unknown> = (
	result,
) => (result ? unnegatableTrueGuard : unnegatableFalseGuard);
