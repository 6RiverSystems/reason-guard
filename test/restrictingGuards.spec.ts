import {assertGuards} from './assertGuards';
import * as restricting from '../src/restrictingGuards';

describe('primitive guards', function() {
	context('isLiteral', function() {
		const testSymbol = Symbol('test');
		const literalList = ['a', 3, testSymbol];
		const guard = restricting.isLiteral(literalList);
		it('guards for things in the literal', function() {
			assertGuards(true)(guard, 'a');
			assertGuards(true)(guard, 3);
			assertGuards(true)(guard, testSymbol);
		});
		it('guards against things not in the literal', function() {
			assertGuards(false)(guard, '3');
			assertGuards(false)(guard, Symbol('test'));
		});
	});
	context('numberIsInteger', function() {
		const guard = restricting.numberIsInteger;
		it('guards for integers', function() {
			assertGuards(true)(guard, -1);
			assertGuards(true)(guard, 0);
			assertGuards(true)(guard, Number.MAX_SAFE_INTEGER);
		});
		it('guards against non-integers', function() {
			assertGuards(false)(guard, 3.3);
			assertGuards(false)(guard, -0.1);
			assertGuards(false)(guard, Number.EPSILON);
		});
	});
	context('>', function() {
		const guard = restricting.numberIsGreaterThan(1);
		it('guards for greater quantities', function() {
			assertGuards(true)(guard, 2);
			assertGuards(true)(guard, 1.1);
			assertGuards(true)(guard, 1 + Number.EPSILON);
		});
		it('guards against non-greater quantities', function() {
			assertGuards(false)(guard, 1);
			assertGuards(false)(guard, 0);
			assertGuards(false)(guard, 1 - Number.EPSILON);
			assertGuards(false)(guard, 0);
		});
	});
	context('<', function() {
		const guard = restricting.numberIsLessThan(1);
		it('guards for smaller quantities', function() {
			assertGuards(true)(guard, -2);
			assertGuards(true)(guard, -1.1);
			assertGuards(true)(guard, 1 - Number.EPSILON);
			assertGuards(true)(guard, 0);
		});
		it('guards against non-smaller quantities', function() {
			assertGuards(false)(guard, 1);
			assertGuards(false)(guard, 1.1);
			assertGuards(false)(guard, 1 + Number.EPSILON);
		});
	});

	context('>=', function() {
		const guard = restricting.numberIsAtLeast(1);
		it('guards for greater-or-equal quantities', function() {
			assertGuards(true)(guard, 2);
			assertGuards(true)(guard, 1.1);
			assertGuards(true)(guard, 1 + Number.EPSILON);
			assertGuards(true)(guard, 1);
		});
		it('guards against non-greater-or-equal quantities', function() {
			assertGuards(false)(guard, 0);
			assertGuards(false)(guard, 1 - Number.EPSILON);
			assertGuards(false)(guard, 0);
		});
	});
	context('<=', function() {
		const guard = restricting.numberIsAtMost(1);
		it('guards for smaller-or-equal quantities', function() {
			assertGuards(true)(guard, -2);
			assertGuards(true)(guard, -1.1);
			assertGuards(true)(guard, 1 - Number.EPSILON);
			assertGuards(true)(guard, 0);
			assertGuards(true)(guard, 1);
		});
		it('guards against non-smaller-or-equal quantities', function() {
			assertGuards(false)(guard, 1.1);
			assertGuards(false)(guard, 1 + Number.EPSILON);
		});
	});
	context('integralInterval', function() {
		const guard = restricting.integralInterval('[', -1)(1, ']');
		it('guards for integers in the range', function() {
			assertGuards(true)(guard, -1);
			assertGuards(true)(guard, 0);
			assertGuards(true)(guard, 1);
		});
		it('guards against non-integers and numbers outside the range', function() {
			assertGuards(false)(guard, Number.EPSILON);
			assertGuards(false)(guard, -2);
			assertGuards(false)(guard, 2);
		});
	});
	context('interval', function() {
		const guard = restricting.interval('(', -1)(1, ')');
		it('guards for numbers in the range', function() {
			assertGuards(true)(guard, -1 + Number.EPSILON);
			assertGuards(true)(guard, 0);
			assertGuards(true)(guard, 1 - Number.EPSILON);
		});
		it('guards against numbers outside the range', function() {
			assertGuards(false)(guard, -1);
			assertGuards(false)(guard, 1);
		});
	});
});
