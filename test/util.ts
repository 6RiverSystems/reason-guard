import {assert} from 'chai';
import { ReasonGuard } from '../src';

export function assertGuardConfirmed<FROM, TO extends FROM>(
	guard: ReasonGuard<FROM, TO>,
	value: FROM,
) {
	const es: Error[] = [];
	const cs: string[] = [];
	assert.isTrue(guard(value, es, cs), 'guard failed unexpectedly');
	assert.lengthOf(es, 0, 'errors on successful guard');
	assert.isAtLeast(cs.length, 1, 'no confirmation reason for successful guard');
}

export function assertGuardFailed<FROM, TO extends FROM>(
	guard: ReasonGuard<FROM, TO>,
	value: FROM,
) {
	const es: Error[] = [];
	const cs: string[] = [];
	assert.isFalse(guard(value, es, cs), 'guard succeeded unexpectedly');
	assert.lengthOf(cs, 0, 'confirmations on failed guard');
	assert.isAtLeast(es.length, 1, 'no error reason for failed guard');
}