import {assertGuards} from './assertGuards';
import {isArray, isDate} from '../src/instanceGuards';

describe('instance guards', function() {
	context('isArray', function() {
		it('guards for arrays', function() {
			assertGuards(true)(isArray, []);
		});
		it('guards against non-arrays', function() {
			assertGuards(false)(isArray, undefined);
			assertGuards(false)(isArray, null);
			assertGuards(false)(isArray, 3);
			assertGuards(false)(isArray, {});
		});
	});
	context('isDate', function() {
		it('guards for dates', function() {
			assertGuards(true)(isDate, new Date());
		});
		it('guards against non-dates', function() {
			assertGuards(false)(isDate, undefined);
			assertGuards(false)(isDate, null);
			assertGuards(false)(isDate, 3);
			assertGuards(false)(isDate, {});
			assertGuards(false)(isDate, new Date().toString());
		});
	});
});
