import { NegatableGuard, makeNegatable } from '../NegatableGuard';
import { ReasonGuard } from '../ReasonGuard';

export const notGuard = <FROM, TO extends FROM, N extends FROM = FROM>(
	inner: ReasonGuard<FROM, TO> | NegatableGuard<FROM, TO, N>,
): NegatableGuard<FROM, N, TO> => makeNegatable<FROM, TO, N>(inner).negate();
