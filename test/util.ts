import {assert} from 'chai';
import {ReasonGuard} from '../src';

export function assertGuardConfirmed<FROM, MID extends FROM, TO extends FROM>(
	guard: ReasonGuard<FROM, TO>,
	value: FROM | MID,
) {
	const es: Error[] = [];
	const cs: string[] = [];
	assert.isTrue(guard(value, es, cs), 'guard failed unexpectedly');
	assert.lengthOf(es, 0, `errors on successful guard: ${es.join(',')}`);
	assert.isAtLeast(cs.length, 1, 'no confirmation reason for successful guard');
}

export function assertGuardFailed<FROM, MID extends FROM, TO extends FROM>(
	guard: ReasonGuard<FROM, TO>,
	value: FROM | MID,
) {
	const es: Error[] = [];
	const cs: string[] = [];
	assert.isFalse(guard(value, es, cs), 'guard succeeded unexpectedly');
	assert.isAtLeast(es.length, 1, 'no error reason for failed guard');
}

export const trueGuard: ReasonGuard<unknown, unknown> = (input, _errs, confs): input is unknown => {
	confs.push('true');
	return true;
};
export const falseGuard: ReasonGuard<unknown, never> = (input, errs, _confs): input is never => {
	try {
		throw new Error('false');
	} catch (err){
		errs.push(err);
		return false;
	}
}
