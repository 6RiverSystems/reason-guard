import {assertGuards} from './assertGuards';
import * as primitive from '../src/primitiveGuards';

describe('primitive guards', function() {
	context('isNumber', function() {
		it('guards for numbers', function() {
			assertGuards(true)(primitive.isNumber, 0);
			assertGuards(true)(primitive.isNumber, 2.7);
			assertGuards(true)(primitive.isNumber, -3);
		});
		it('guards against non-numbers', function() {
			assertGuards(false)(primitive.isNumber, 'string');
			assertGuards(false)(primitive.isNumber, undefined);
			assertGuards(false)(primitive.isNumber, null);
			assertGuards(false)(primitive.isNumber, {});
		});
	});
	context('isString', function() {
		it('guards for strings', function() {
			assertGuards(true)(primitive.isString, '');
			assertGuards(true)(primitive.isString, 'string');
		});
		it('guards against non-strings', function() {
			assertGuards(false)(primitive.isString, 7);
			assertGuards(false)(primitive.isString, undefined);
			assertGuards(false)(primitive.isString, null);
			assertGuards(false)(primitive.isString, {});
		});
	});
	context('isLiteral', function() {
		const testSymbol = Symbol('test');
		const literalList = ['a', 3, testSymbol];
		const guard = primitive.isLiteral(literalList);
		it('guards for things in the literal', function() {
			assertGuards(true)(guard, 'a');
			assertGuards(true)(guard, 3);
			assertGuards(true)(guard, testSymbol);
		});
		it('guards against things not in the literal', function() {
			assertGuards(false)(guard, '3');
			assertGuards(false)(guard, Symbol('test'));
		});
	})
});
