import 'mocha';
import {assertGuardConfirmed, assertGuardFailed} from './util';
import {isArray, isDate} from '../src/instanceGuards'

describe('instance guards', function() {
	context('isArray', function() {
		it('guards for arrays', function() {
			assertGuardConfirmed(isArray, []);
		});
		it('guards against non-arrays', function() {
			assertGuardFailed(isArray, undefined);
			assertGuardFailed(isArray, null);
			assertGuardFailed(isArray, 3);
			assertGuardFailed(isArray, {});
		});
	});
	context('isDate', function() {
		it('guards for dates', function() {
			assertGuardConfirmed(isDate, new Date());
		});
		it('guards against non-dates', function() {
			assertGuardFailed(isDate, undefined);
			assertGuardFailed(isDate, null);
			assertGuardFailed(isDate, 3);
			assertGuardFailed(isDate, {});
			assertGuardFailed(isDate, new Date().toString());
		});
	});
});