import {ReasonGuard} from './ReasonGuard';

export type NegatableGuard<FROM, TO extends FROM, N extends FROM = FROM> = ReasonGuard<FROM, TO> & {
	negate: () => NegatableGuard<FROM, N, TO>
}

export type AlternativeGuard<LEFT, RIGHT> = NegatableGuard<LEFT|RIGHT, LEFT, RIGHT>;

export const isNegatableGuard =
	<FROM, TO extends FROM, N extends FROM = FROM>
	(input: ReasonGuard<FROM, TO>): input is NegatableGuard<FROM, TO, N> =>
		typeof input === 'function' && typeof (input as any).negate === 'function';
