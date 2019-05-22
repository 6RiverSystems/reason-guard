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
	context('isUndefined', function() {
		it('guards for undefined', function() {
			assertGuards(true)(primitive.isUndefined, undefined);
			assertGuards(true)(primitive.isUndefined, ({} as any).testProperty);
		});
		it('guards against anything else', function() {
			assertGuards(false)(primitive.isUndefined, 7);
			assertGuards(false)(primitive.isUndefined, '');
			assertGuards(false)(primitive.isUndefined, null);
			assertGuards(false)(primitive.isUndefined, {});
		});
	});
	context('isNull', function() {
		it('guards for null', function() {
			assertGuards(true)(primitive.isNull, null);
		});
		it('guards against anything else', function() {
			assertGuards(false)(primitive.isNull, ({} as any).testProperty);
			assertGuards(false)(primitive.isNull, 7);
			assertGuards(false)(primitive.isNull, '');
			assertGuards(false)(primitive.isNull, undefined);
			assertGuards(false)(primitive.isNull, {});
		});
	});
});
