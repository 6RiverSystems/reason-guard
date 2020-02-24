import { assert } from 'chai';
import { ReasonGuard } from '../src';

type assertGuard = <FROM, MID extends FROM, TO extends FROM>(
	guard: ReasonGuard<FROM, TO>,
	value: FROM | MID,
) => void;

function assertGuardConfirmed<FROM, MID extends FROM, TO extends FROM>(
	guard: ReasonGuard<FROM, TO>,
	value: FROM | MID,
) {
	const es: Error[] = [];
	const cs: string[] = [];
	assert.isTrue(
		guard(value, es, cs),
		`guard failed unexpectedly on ${JSON.stringify(value)}: ${es.join(', ')}`,
	);
	assert.lengthOf(es, 0, `errors on successful guard: ${es.join(', ')}`);
	assert.isAtLeast(cs.length, 1, `no confirmation reason for successful guard`);
	assert.isTrue(guard(value), `guard provides default values for detail arrays`);
}

function assertGuardFailed<FROM, MID extends FROM, TO extends FROM>(
	guard: ReasonGuard<FROM, TO>,
	value: FROM | MID,
) {
	const es: Error[] = [];
	const cs: string[] = [];
	assert.isFalse(
		guard(value, es, cs),
		`guard succeeded unexpectedly on ${JSON.stringify(value)}: ${cs.join(', ')}`,
	);
	assert.isAtLeast(es.length, 1, `no error reason for failed guard`);
	assert.isFalse(guard(value), `guard provides default values for detail arrays`);
}

export const assertGuards: (result: boolean) => assertGuard = (result: boolean) =>
	result ? assertGuardConfirmed : assertGuardFailed;
