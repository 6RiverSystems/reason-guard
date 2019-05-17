import {testCombinator1, Tautology, testCombinator2} from './testCombinator';
import {notGuard, orGuard, andGuard} from '../../src';

describe('not', function() {
	context('pure not', function() {
		testCombinator1('!', [true, false, false, true], notGuard);
	});
	context('not-or', function() {
		const notOr = (left: Tautology, right: Tautology) => notGuard(orGuard(left, right));
		testCombinator2('!|', [true, false, false, false], notOr);
	});
	context('not-and', function() {
		const notAnd = (left: Tautology, right: Tautology) => notGuard(andGuard(left, right));
		testCombinator2('!&', [true, true, true, false], notAnd);
	});
});
