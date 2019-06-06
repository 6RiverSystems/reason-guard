import {ReasonGuard} from './ReasonGuard';

export type ArrayFilterGuard<FROM, TO extends FROM> = (input: FROM) => input is TO;

/**
 * creates a plain type guard that can be passed directly to Array.filter
 */
export const arrayFilterGuard = <FROM, TO extends FROM>(guard: ReasonGuard<FROM, TO>): ArrayFilterGuard<FROM, TO> =>
	(input): input is TO => guard(input, [], []);
