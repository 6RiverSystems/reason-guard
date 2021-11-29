import { isNegatableGuard, NegatableGuard, buildNegatable } from '../NegatableGuard';
import { ErrorLike, ReasonGuard } from '../ReasonGuard';

export const notGuard = <FROM, TO extends FROM, N extends FROM = FROM>(
	inner: ReasonGuard<FROM, TO> | NegatableGuard<FROM, TO, N>,
) =>
	isNegatableGuard(inner)
		? inner.negate()
		: buildNegatable<FROM, N, TO>(
				() => negate(inner),
				() => inner,
		  );

export function negate<FROM, TO extends FROM, N extends FROM>(
	inner: ReasonGuard<FROM, TO>,
): ReasonGuard<FROM, N> {
	return (input: FROM, errors?: ErrorLike[], confirmations?: string[]): input is N => {
		try {
			let innerErrors: ErrorLike[] | undefined;
			let innerConfirmations: string[] | undefined;
			if (confirmations) {
				innerErrors = [];
			}
			if (errors) {
				innerConfirmations = [];
			}
			if (inner(input, innerErrors, innerConfirmations)) {
				if (!innerConfirmations) {
					return false;
				}
				throw new Error(innerConfirmations[innerConfirmations.length - 1]);
			} else {
				if (innerErrors) {
					confirmations?.push(innerErrors[0].message);
				}
				return true;
			}
		} catch (err: any) {
			errors?.push(err);
			return false;
		}
	};
}
