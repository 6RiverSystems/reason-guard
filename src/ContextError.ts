export class ContextError extends Error {
	constructor(message?: string, public readonly context?: ReadonlyArray<PropertyKey>) {
		super(message);
	}
}
