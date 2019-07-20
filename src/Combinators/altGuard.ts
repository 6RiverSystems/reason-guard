import {ReasonGuard} from '../ReasonGuard';
import {notGuard} from './notGuard';
import {buildNegatable} from '../NegatableGuard';

/**
 * A guard that narrows an A/B choice to a single alternative
 */

export const altGuard = <LEFT, RIGHT>(left: ReasonGuard<LEFT|RIGHT, LEFT>) => buildNegatable(
	() => getRawAlt(left),
	() => getRawNegatedAlt<LEFT, RIGHT>(left)
);

const getRawAlt =
	<(<LEFT, RIGHT>(left: ReasonGuard<LEFT|RIGHT, LEFT>) =>
	ReasonGuard<LEFT|RIGHT, LEFT>)>((left) => left);

const getRawNegatedAlt =
	<(<LEFT, RIGHT>(left: ReasonGuard<LEFT|RIGHT, LEFT>) =>
	ReasonGuard<LEFT|RIGHT, RIGHT>)>((left) => notGuard(left));
