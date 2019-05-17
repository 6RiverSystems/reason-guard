import {buildNegatable, notGuard, unnegatableConstantGuards} from '../src';
import {assertGuards} from './assertGuards';
import {assert} from 'chai';

describe('NegatableGuard', function() {
	context(buildNegatable.name, function() {
		const ng = buildNegatable(
			() => unnegatableConstantGuards(true),
			() => unnegatableConstantGuards(false),
		);
		it('runs', function() {
			assertGuards(true)(ng, undefined);
		});
		context('direct negation', function() {
			it('negates', function() {
				assertGuards(false)(ng.negate(), undefined);
			});
			it('double-negates', function() {
				assertGuards(true)(ng.negate().negate(), undefined);
			});
			it('limits recursion', function() {
				assert.strictEqual(ng, ng.negate().negate());
			});
		});
		context('not-negation', function() {
			const ngn1 = notGuard(ng);
			const ngn2 = notGuard(ngn1);
			it('negates', function() {
				assertGuards(false)(ngn1, undefined);
			});
			it('double-negates', function() {
				assertGuards(true)(ngn2, undefined);
			});
			it('limits recursion', function() {
				assert.strictEqual(ng, ngn2);
			});
		});
	});
});
