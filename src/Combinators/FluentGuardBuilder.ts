import { andGuard, orGuard } from './booleanGuard';
import { notGuard } from './notGuard';
import { thenGuard } from './thenGuard';
import { ReasonGuard } from '../ReasonGuard';

export class FluentGuardBuilder<FROM, TO extends FROM> {
	constructor(private readonly _guard: ReasonGuard<FROM, TO>) {}
	public get guard() {
		return this._guard;
	}
	public or<TO2 extends FROM>(guard: ReasonGuard<FROM, TO2>) {
		return new FluentGuardBuilder(orGuard(this.guard, guard));
	}
	public and<TO2 extends FROM>(guard: ReasonGuard<FROM, TO2>) {
		return new FluentGuardBuilder(andGuard(this.guard, guard));
	}
	public then<TO2 extends TO>(guard: ReasonGuard<TO, TO2>) {
		return new FluentGuardBuilder(thenGuard(this.guard, guard));
	}
	public not() {
		return new FluentGuardBuilder(notGuard(this.guard));
	}
}
