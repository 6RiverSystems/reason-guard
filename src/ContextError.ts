import { ErrorLike } from './ReasonGuard';

export class ContextError implements ErrorLike {
	constructor(
		public readonly message: string,
		public readonly context?: ReadonlyArray<PropertyKey>,
	) {}
}

export class CompositeError implements ErrorLike {
	public readonly message;
	constructor(public readonly errors: ReadonlyArray<ErrorLike>) {
		this.message = `composite of ${errors.length} error(s)`;
	}
}
