import { assert } from 'chai';

import { testTwoArgCombinator } from './testCombinator';
import { ReasonGuard, andGuard } from '../../src';

describe('and', function () {
	it('behaves as && at runtime', function () {
		testTwoArgCombinator('&', [false, false, false, true], andGuard);
	});

	it('can add up objects', function () {
		type A = { a: string };
		type B = { b: string };
		type C = A & B;
		const left: ReasonGuard<unknown, A> = (() => true) as any;
		const right: ReasonGuard<unknown, B> = (() => true) as any;
		// What we really care about is that this typechecks
		const and: ReasonGuard<A, C> = andGuard(left, right);
		assert.isOk(and);
	});
});
