import 'mocha';
import {assertGuardConfirmed, assertGuardFailed} from './util';
import {arrayHasType} from '../src/arrayHasType';
import {isNumber} from '../src/primitiveGuards';

describe('array has type', function() {
	it('guards for correct type', function() {
		assertGuardConfirmed(arrayHasType(isNumber), [1, 2]);
	});
	it('guards against wrong type', function() {
		assertGuardFailed(arrayHasType(isNumber), ['string', 'string']);
	});
	it('accepts empty array', function() {
		assertGuardConfirmed(arrayHasType(isNumber), []);
	});
	it('guards against mixed type', function() {
		assertGuardFailed(arrayHasType(isNumber), [1, undefined, 3]);
	});
});