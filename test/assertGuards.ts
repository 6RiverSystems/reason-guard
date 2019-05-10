import {assert} from 'chai';
import { ReasonGuard, checkerToGuard } from '../src';

type assertGuard = <FROM, TO extends FROM>(guard: ReasonGuard<FROM, TO>, value: FROM) => void;

function assertGuardConfirmed<FROM, TO extends FROM>(
	guard: ReasonGuard<FROM, TO>,
	value: FROM,
) {
	const es: Error[] = [];
	const cs: string[] = [];
	assert.isTrue(guard(value, es, cs), 'guard failed unexpectedly');
	assert.lengthOf(es, 0, `errors on successful guard: ${es.join(',')}`);
	assert.isAtLeast(cs.length, 1, 'no confirmation reason for successful guard');
}

function assertGuardFailed<FROM, TO extends FROM>(
	guard: ReasonGuard<FROM, TO>,
	value: FROM,
) {
	const es: Error[] = [];
	const cs: string[] = [];
	assert.isFalse(guard(value, es, cs), 'guard succeeded unexpectedly');
	assert.isAtLeast(es.length, 1, 'no error reason for failed guard');
}

export const assertGuards: (result: boolean) => assertGuard =
	(result: boolean) => result ? assertGuardConfirmed : assertGuardFailed;