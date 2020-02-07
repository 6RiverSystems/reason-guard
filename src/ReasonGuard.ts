export type ReasonGuard<FROM, TO extends FROM> = (
	input: FROM,
	output?: Error[],
	confirmations?: string[],
	context?: PropertyKey[],
) => input is TO;

export const cloneGuard =
	<FROM, TO extends FROM>
	(g: ReasonGuard<FROM, TO>): ReasonGuard<FROM, TO> =>
		(input, es, cs, context): input is TO =>
			g(input, es, cs, context);
