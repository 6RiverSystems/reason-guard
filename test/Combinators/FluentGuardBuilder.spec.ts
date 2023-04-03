import { testTwoArgCombinator, testOneArgCombinator } from './testCombinator';
import { FluentGuardBuilder } from '../../src';

describe('Builders', function () {
	context('ands', function () {
		testTwoArgCombinator(
			'&',
			[false, false, false, true],
			(left, right) => new FluentGuardBuilder(left).and(right).guard,
		);
	});
	context('ors', function () {
		testTwoArgCombinator(
			'|',
			[false, true, true, true],
			(left, right) => new FluentGuardBuilder(left).or(right).guard,
		);
	});
	context('thens', function () {
		testTwoArgCombinator(
			',',
			[false, false, false, true],
			(left, right) => new FluentGuardBuilder(left).then(right).guard,
		);
	});
	context('nots', function () {
		testOneArgCombinator(
			'!',
			[true, false, false, true],
			(left) => new FluentGuardBuilder(left).not().guard,
		);
	});
});
