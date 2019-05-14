import {ReasonGuard} from './ReasonGuard';
import {checkerToGuard} from './Checker';

const trueGuard: ReasonGuard<unknown, unknown> =
	checkerToGuard(() => 'true');

const falseGuard: ReasonGuard<unknown, never> =
	checkerToGuard(() => {
		throw new Error('false');
	});

export const constantGuards: (result: boolean) => ReasonGuard<unknown, unknown> =
	(result: boolean) => result ? trueGuard : falseGuard;
