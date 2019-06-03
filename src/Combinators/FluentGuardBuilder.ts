import {NegatableGuard} from '../NegatableGuard';
import {orGuard} from './orGuard';
import {andGuard} from './andGuard';
import {thenGuard} from './thenGuard';
import {notGuard} from './notGuard';

export class FluentGuardBuilder<FROM, TO extends FROM, N extends FROM> {
	constructor(public readonly guard: NegatableGuard<FROM, TO, N>) {}
	public or(guard: NegatableGuard<FROM, TO, N>) {
		return orGuard(this.guard, guard);
	}
	public and(guard: NegatableGuard<FROM, TO, N>) {
		return andGuard(this.guard, guard);
	}
	public then(guard: NegatableGuard<FROM, TO, N>) {
		return thenGuard(this.guard, guard);
	}
	public not() {
		return notGuard(this.guard);
	}
}
