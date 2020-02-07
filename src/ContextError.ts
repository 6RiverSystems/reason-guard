export class ContextError extends Error {
	constructor(message?: string, public readonly context?: ReadonlyArray<PropertyKey>) {
		super(message);
	}
}

export class CompositeError extends Error {
	constructor(public readonly errors: ReadonlyArray<Error>) {
		super(`composite of ${errors.length} error(s)`);
	}
}
