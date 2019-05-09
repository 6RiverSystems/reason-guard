import 'mocha';
import {assert} from 'chai';
import * as primitive from '../src/primitiveGuards';
import {assertGuardConfirmed, assertGuardFailed} from './util';

describe('primitive guards', function() {
	context('isNumber', function() {
		it('guards for numbers', function() {
			assertGuardConfirmed(primitive.isNumber, 0);
			assertGuardConfirmed(primitive.isNumber, 2.7);
			assertGuardConfirmed(primitive.isNumber, -3);
		});
		it('guards against non-numbers', function() {
			assertGuardFailed(primitive.isNumber, 'string');
			assertGuardFailed(primitive.isNumber, undefined);
			assertGuardFailed(primitive.isNumber, null);
			assertGuardFailed(primitive.isNumber, {});
		});
	});
	context('isString', function() {
		it('guards for strings', function() {
			assertGuardConfirmed(primitive.isString, '');
			assertGuardConfirmed(primitive.isString, 'string');
		});
		it('guards against non-strings', function() {
			assertGuardFailed(primitive.isString, 7);
			assertGuardFailed(primitive.isString, undefined);
			assertGuardFailed(primitive.isString, null);
			assertGuardFailed(primitive.isString, {});
		});
	});
});
