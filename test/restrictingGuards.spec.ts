import {assertGuards} from './assertGuards';
import * as restricting from '../src/restrictingGuards';

describe('restricting guards', function() {
	context('isUUID', function() {
		it('should guard for a valid UUID', function() {
			assertGuards(true)(restricting.isUUID, '0ca8f69c-1d07-4404-9b82-d1d0eb492313');
		});
		it('should guard against a invalid UUID', function() {
			assertGuards(false)(restricting.isUUID, '');
			assertGuards(false)(restricting.isUUID, '123');
			assertGuards(false)(restricting.isUUID, 123);
		});
	});
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
	context('isStrictEqual', function() {
		const testSymbol = Symbol('test');
		const valueList = ['a', 5, true, false, testSymbol];
		const badValuesLists: unknown[][] = [[1, 'b'], [4, 'a'], [false], [true], [Symbol('test'), Symbol('bad')]];
		const guards = valueList.map((v) => restricting.isStrictEqual(v));
		it('guards for the exact value', function() {
			guards.forEach((guard, i) => assertGuards(true)(guard, valueList[i]));
		});
		it('guards against other values', function() {
			guards.forEach((guard, i) => valueList.forEach((badValue, j) => {
				if (i !== j) {
					assertGuards(false)(guard, badValue);
				}
			}));
			guards.forEach((guard, i) => badValuesLists[i].forEach((badValue) => assertGuards(false)(guard, badValue)));
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
			assertGuards(false)(guard, Number.NEGATIVE_INFINITY);
			assertGuards(false)(guard, Number.POSITIVE_INFINITY);
			assertGuards(false)(guard, Number.NaN);
		});
	});
	context('numberIs', function() {
		context('given the target value is finite', function() {
			const guard = restricting.numberIs(1);
			it('guards for the correct value', function() {
				assertGuards(true)(guard, 1);
			});
			it('guards against finite incorrect values', function() {
				assertGuards(false)(guard, 1 + Number.EPSILON);
				assertGuards(false)(guard, 1 - Number.EPSILON);
			});
			it('guards against non-finite values', function() {
				assertGuards(false)(guard, Number.NEGATIVE_INFINITY);
				assertGuards(false)(guard, Number.POSITIVE_INFINITY);
				assertGuards(false)(guard, Number.NaN);
			});
		});
		context('given the target value is positive infinity', function() {
			const guard = restricting.numberIs(Number.POSITIVE_INFINITY);
			it('guards for positive infinity', function() {
				assertGuards(true)(guard, Number.POSITIVE_INFINITY);
			});
			it('guards against incorrect values', function() {
				assertGuards(false)(guard, 0);
				assertGuards(false)(guard, Number.MAX_VALUE);
				assertGuards(false)(guard, Number.NEGATIVE_INFINITY);
				assertGuards(false)(guard, Number.NaN);
			});
		});
		context('given the target value is negative infinity', function() {
			const guard = restricting.numberIs(Number.NEGATIVE_INFINITY);
			it('guards for negative infinity', function() {
				assertGuards(true)(guard, Number.NEGATIVE_INFINITY);
			});
			it('guards against incorrect values', function() {
				assertGuards(false)(guard, 0);
				assertGuards(false)(guard, Number.MIN_VALUE);
				assertGuards(false)(guard, Number.POSITIVE_INFINITY);
				assertGuards(false)(guard, Number.NaN);
			});
		});
		context('given the target value is NaN', function() {
			const guard = restricting.numberIs(Number.NaN);
			it('guards for NaN', function() {
				assertGuards(true)(guard, Number.NaN);
			});
			it('guards against incorrect values', function() {
				assertGuards(false)(guard, 0);
				assertGuards(false)(guard, Number.MIN_VALUE);
				assertGuards(false)(guard, Number.MAX_VALUE);
				assertGuards(false)(guard, Number.NEGATIVE_INFINITY);
				assertGuards(false)(guard, Number.POSITIVE_INFINITY);
			});
		});
	});
	context('numberIsFinite', function() {
		const guard = restricting.numberIsFinite;
		it('guards for finite values', function() {
			assertGuards(true)(guard, Number.MIN_VALUE);
			assertGuards(true)(guard, Number.MIN_SAFE_INTEGER);
			assertGuards(true)(guard, -1);
			assertGuards(true)(guard, 0);
			assertGuards(true)(guard, 1);
			assertGuards(true)(guard, Number.MIN_SAFE_INTEGER);
			assertGuards(true)(guard, Number.MAX_VALUE);
		});
		it('guards against non-finite values', function() {
			assertGuards(false)(guard, Number.NEGATIVE_INFINITY);
			assertGuards(false)(guard, Number.POSITIVE_INFINITY);
			assertGuards(false)(guard, Number.NaN);
		});
	});
	context('>', function() {
		const guard = restricting.numberIsGreaterThan(1);
		it('guards for greater quantities', function() {
			assertGuards(true)(guard, 2);
			assertGuards(true)(guard, 1.1);
			assertGuards(true)(guard, 1 + Number.EPSILON);
			assertGuards(true)(guard, Number.POSITIVE_INFINITY);
		});
		it('guards against non-greater quantities', function() {
			assertGuards(false)(guard, 1);
			assertGuards(false)(guard, 0);
			assertGuards(false)(guard, 1 - Number.EPSILON);
			assertGuards(false)(guard, 0);
			assertGuards(false)(guard, Number.NEGATIVE_INFINITY);
			assertGuards(false)(guard, Number.NaN);
		});
	});
	context('<', function() {
		const guard = restricting.numberIsLessThan(1);
		it('guards for smaller quantities', function() {
			assertGuards(true)(guard, -2);
			assertGuards(true)(guard, -1.1);
			assertGuards(true)(guard, 1 - Number.EPSILON);
			assertGuards(true)(guard, 0);
			assertGuards(true)(guard, Number.NEGATIVE_INFINITY);
		});
		it('guards against non-smaller quantities', function() {
			assertGuards(false)(guard, 1);
			assertGuards(false)(guard, 1.1);
			assertGuards(false)(guard, 1 + Number.EPSILON);
			assertGuards(false)(guard, Number.POSITIVE_INFINITY);
			assertGuards(false)(guard, Number.NaN);
		});
	});

	context('>=', function() {
		const guard = restricting.numberIsAtLeast(1);
		it('guards for greater-or-equal quantities', function() {
			assertGuards(true)(guard, 2);
			assertGuards(true)(guard, 1.1);
			assertGuards(true)(guard, 1 + Number.EPSILON);
			assertGuards(true)(guard, 1);
			assertGuards(true)(guard, Number.POSITIVE_INFINITY);
		});
		it('guards against non-greater-or-equal quantities', function() {
			assertGuards(false)(guard, 0);
			assertGuards(false)(guard, 1 - Number.EPSILON);
			assertGuards(false)(guard, 0);
			assertGuards(false)(guard, Number.NEGATIVE_INFINITY);
			assertGuards(false)(guard, Number.NaN);
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
			assertGuards(true)(guard, Number.NEGATIVE_INFINITY);
		});
		it('guards against non-smaller-or-equal quantities', function() {
			assertGuards(false)(guard, 1.1);
			assertGuards(false)(guard, 1 + Number.EPSILON);
			assertGuards(false)(guard, Number.POSITIVE_INFINITY);
			assertGuards(false)(guard, Number.NaN);
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
			assertGuards(false)(guard, Number.NEGATIVE_INFINITY);
			assertGuards(false)(guard, Number.POSITIVE_INFINITY);
			assertGuards(false)(guard, Number.NaN);
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
			assertGuards(false)(guard, Number.NEGATIVE_INFINITY);
			assertGuards(false)(guard, Number.POSITIVE_INFINITY);
			assertGuards(false)(guard, Number.NaN);
		});
	});
	context('safe', function() {
		const guard = restricting.numberIsSafeInteger;
		it('guards for integers in the range', function() {
			assertGuards(true)(guard, Number.MIN_SAFE_INTEGER);
			assertGuards(true)(guard, Number.MAX_SAFE_INTEGER);
			assertGuards(true)(guard, 0);
		});
		it('guards against integers outside the range', function() {
			assertGuards(false)(guard, Number.MIN_SAFE_INTEGER - 1);
			assertGuards(false)(guard, Number.MAX_SAFE_INTEGER + 1);
		});
		it('guards against non-integers', function() {
			assertGuards(false)(guard, 0.999999999);
			assertGuards(false)(guard, Number.MIN_SAFE_INTEGER * (1 + Number.EPSILON));
			assertGuards(false)(guard, Number.MAX_SAFE_INTEGER * (1 + Number.EPSILON));
			assertGuards(false)(guard, Number.NEGATIVE_INFINITY);
			assertGuards(false)(guard, Number.POSITIVE_INFINITY);
			assertGuards(false)(guard, Number.NaN);
		});
	});
});
