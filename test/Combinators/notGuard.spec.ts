import {testOneArgCombinator, Tautology, testTwoArgCombinator} from './testCombinator';
import {notGuard, orGuard, andGuard} from '../../src';

describe('not', function() {
	context('pure not', function() {
		testOneArgCombinator('!', [true, false, false, true], notGuard);
	});
	context('not-or', function() {
		const notOr = (left: Tautology, right: Tautology) => notGuard(orGuard(left, right));
		testTwoArgCombinator('!|', [true, false, false, false], notOr);
	});
	context('not-and', function() {
		const notAnd = (left: Tautology, right: Tautology) => notGuard(andGuard<unknown, unknown, unknown>(left, right));
		testTwoArgCombinator('!&', [true, true, true, false], notAnd);
	});
});
