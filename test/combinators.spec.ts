import {assertGuards} from './assertGuards';
import {orGuard, notGuard, andGuard, thenGuard} from '../src/Combinators';
import {constantGuards} from '../src/constantGuards';
import {ReasonGuard} from '../src';

type Tautology = ReasonGuard<unknown, unknown>;
const abbrev = (b: boolean) => b ? 'T' : 'F';

describe('combinators', function() {
	context('or', function() {
		testCombinator2('|', [false, true, true, true], orGuard);
	});
	context('and', function() {
		testCombinator2('&', [false, false, false, true], andGuard);
	});
	context('then', function() {
		testCombinator2(',', [false, false, false, true], thenGuard);
	});
	context('not', function() {
		testCombinator1('!', [true, false], notGuard);
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

function testCombinator1(char: string, result: [boolean, boolean], combinator: (inner: Tautology) => Tautology) {
	const t = (
		success: boolean,
		inner: boolean,
	) => assertGuards(success)(combinator(constantGuards(inner)), undefined);
	it(char + 'F=' + abbrev(result[0]), function() {
		t(result[0], false);
	});
	it(char + 'T=' + abbrev(result[1]), function() {
		t(result[1], true);
	});
}

function testCombinator2(
	char: string,
	result: [boolean, boolean, boolean, boolean],
	combinator: (left: Tautology, right: Tautology) => Tautology
) {
	const t = (
		success: boolean,
		left: boolean,
		right: boolean
	) => assertGuards(success)(combinator(constantGuards(left), constantGuards(right)), undefined);
	it('F' + char + 'F=' + abbrev(result[0]), function() {
		t(result[0], false, false);
	});
	it('F' + char + 'F=' + abbrev(result[1]), function() {
		t(result[1], false, true);
	});
	it('F' + char + 'F=' + abbrev(result[2]), function() {
		t(result[2], true, false);
	});
	it('F' + char + 'F=' + abbrev(result[3]), function() {
		t(result[3], true, true);
	});
}
