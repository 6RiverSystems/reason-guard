import {orGuard} from './orGuard';
import {andGuard} from './andGuard';
import {thenGuard} from './thenGuard';
import {notGuard} from './notGuard';
import {ReasonGuard} from '../ReasonGuard';

export class FluentGuardBuilder<FROM, TO extends FROM> {
	constructor(private readonly _guard: ReasonGuard<FROM, TO>) {
		// eslint-disable-next-line no-console
		console.log('new guard');
	}
	public get guard() {
		// eslint-disable-next-line no-console
		console.log('getting guard');
		return this._guard;
	}
	public or(guard: ReasonGuard<FROM, TO>) {
		return new FluentGuardBuilder(orGuard(this.guard, guard));
	}
	public and(guard: ReasonGuard<FROM, TO>) {
		return new FluentGuardBuilder(andGuard(this.guard, guard));
	}
	public then(guard: ReasonGuard<FROM, TO>) {
		return new FluentGuardBuilder(thenGuard(this.guard, guard));
	}
	public not() {
		return new FluentGuardBuilder(notGuard(this.guard));
	}
}
