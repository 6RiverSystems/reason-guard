import { ReasonGuard, constantGuards, unnegatableConstantGuards } from '../../src';
import { assertGuards } from '../assertGuards';

export type Tautology = ReasonGuard<unknown, unknown>;
export const abbrev = (b: boolean) => (b ? 'T' : 'F');

export function testOneArgCombinator(
	char: string,
	result: [boolean, boolean, boolean, boolean],
	combinator: (inner: Tautology) => Tautology,
) {
	for (const guardSource of [constantGuards, unnegatableConstantGuards]) {
		const t = (success: boolean, inner: boolean) =>
			assertGuards(success)(combinator(guardSource(inner)), undefined);
		const tt = (success: boolean, inner: boolean) =>
			assertGuards(success)(combinator(combinator(guardSource(inner))), undefined);
		it(char + 'F=' + abbrev(result[0]), function() {
			t(result[0], false);
		});
		it(char + 'T=' + abbrev(result[1]), function() {
			t(result[1], true);
		});
		it(char + char + 'F=' + abbrev(result[2]), function() {
			tt(result[2], false);
		});
		it(char + char + 'T=' + abbrev(result[2]), function() {
			tt(result[3], true);
		});
	}
}

export function testTwoArgCombinator(
	char: string,
	result: [boolean, boolean, boolean, boolean],
	combinator: (left: Tautology, right: Tautology) => Tautology,
) {
	const t = (success: boolean, left: boolean, right: boolean) =>
		assertGuards(success)(combinator(constantGuards(left), constantGuards(right)), undefined);
	it('F' + char + 'F=' + abbrev(result[0]), function() {
		t(result[0], false, false);
	});
	it('F' + char + 'T=' + abbrev(result[1]), function() {
		t(result[1], false, true);
	});
	it('T' + char + 'F=' + abbrev(result[2]), function() {
		t(result[2], true, false);
	});
	it('T' + char + 'T=' + abbrev(result[3]), function() {
		t(result[3], true, true);
	});
}
