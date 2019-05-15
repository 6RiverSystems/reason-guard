import {ReasonGuard} from '../ReasonGuard';
import {notGuard} from './notGuard';
import {NegatableGuard} from '../NegatableGuard';

export const altGuard = getAltGuard;

const getRawAlt =
		<(<LEFT, RIGHT>(left: ReasonGuard<LEFT|RIGHT, LEFT>) =>
		ReasonGuard<LEFT|RIGHT, LEFT>)>((left) => left);

const getRawNegatedAlt =
	<(<LEFT, RIGHT>(left: ReasonGuard<LEFT|RIGHT, LEFT>) =>
	ReasonGuard<LEFT|RIGHT, RIGHT>)>((left) => notGuard(left));

function getAltGuard<LEFT, RIGHT>(
	left: ReasonGuard<LEFT|RIGHT, LEFT>
): NegatableGuard<LEFT|RIGHT, LEFT, RIGHT> {
	return Object.assign(getRawAlt(left), {negate: () => getNegatedAltGuard<LEFT, RIGHT>(left)});
}

function getNegatedAltGuard<LEFT, RIGHT>(
	left: ReasonGuard<LEFT|RIGHT, LEFT>
): NegatableGuard<LEFT|RIGHT, RIGHT, LEFT> {
	return Object.assign(getRawNegatedAlt<LEFT, RIGHT>(left), {negate: () => getAltGuard<LEFT, RIGHT>(left)});
}
