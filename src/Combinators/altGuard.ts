import { makeNegatable } from '../NegatableGuard';
import { ReasonGuard } from '../ReasonGuard';

/**
 * A guard that narrows an A/B choice to a single alternative
 */
export const altGuard = <LEFT, RIGHT>(left: ReasonGuard<LEFT | RIGHT, LEFT>) => makeNegatable(left);
