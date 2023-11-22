/**
 * creating real errors is costly, due to capturing the stack trace at
 * instantiation, so instead capture validation errors as just error-like
 * objects.
 */
export interface ErrorLike {
	message: string;
}

export function errorLike(message: string): ErrorLike {
	return { message };
}

export type ReasonGuard<FROM, TO extends FROM> = (
	input: FROM,
	output?: ErrorLike[],
	confirmations?: string[],
	context?: PropertyKey[],
) => input is TO;

/**
 * @deprecated this is generally unnecessary and slows things down
 */
export const cloneGuard =
	<FROM, TO extends FROM>(g: ReasonGuard<FROM, TO>): ReasonGuard<FROM, TO> =>
	(input, es, cs, context): input is TO =>
		g(input, es, cs, context);
