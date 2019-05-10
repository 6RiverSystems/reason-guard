import 'mocha';
import {assertGuards} from './assertGuards';
import {arrayHasType} from '../src/arrayHasType';
import {isNumber} from '../src/primitiveGuards';

describe('array has type', function() {
	it('guards for correct type', function() {
		assertGuards(true)(arrayHasType(isNumber), [1, 2]);
	});
	it('guards against wrong type', function() {
		assertGuards(false)(arrayHasType(isNumber), ['string', 'string']);
	});
	it('accepts empty array', function() {
		assertGuards(true)(arrayHasType(isNumber), []);
	});
	it('guards against mixed type', function() {
		assertGuards(false)(arrayHasType(isNumber), [1, undefined, 3]);
	});
});