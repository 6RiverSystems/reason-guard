import { assertGuards } from './assertGuards';
import { GuardSingleGenerator, assertBenchGuard } from './benchGuards';
import * as primitive from '../src/primitiveGuards';

function aFunction() {}

describe('primitive guards', function () {
	// share input data across tests so that we don't need to recreate big arrays
	const numbers = new GuardSingleGenerator(Math.random.bind(Math));
	const strings = new GuardSingleGenerator(() => Math.random().toString());
	const trues = new GuardSingleGenerator(() => true);
	const nulls = new GuardSingleGenerator(() => null);
	// cSpell:ignore undefineds
	const undefineds = new GuardSingleGenerator(() => undefined);
	const functions = new GuardSingleGenerator(() => aFunction);

	before(function () {
		// preload the test data
		for (const gen of [numbers, strings, trues, nulls, undefineds, functions]) {
			gen.ensure(10_000_000);
		}
		// try to avoid having any GC time counted in the test by forcing it to run early
		global.gc?.();
		// console.log('profiler breakpoint');
	});
	after(function () {
		// console.log('profiler breakpoint');
	});

	context('isNumber', function () {
		it('guards for numbers', function () {
			assertGuards(true)(primitive.isNumber, 0);
			assertGuards(true)(primitive.isNumber, 2.7);
			assertGuards(true)(primitive.isNumber, -3);
		});
		it('guards against non-numbers', function () {
			assertGuards(false)(primitive.isNumber, 'string');
			assertGuards(false)(primitive.isNumber, undefined);
			assertGuards(false)(primitive.isNumber, null);
			assertGuards(false)(primitive.isNumber, {});
		});
		it('is fast', function () {
			assertBenchGuard(this, primitive.isNumber, numbers, trues);
		}).timeout(10_000);
	});
	context('isString', function () {
		it('guards for strings', function () {
			assertGuards(true)(primitive.isString, '');
			assertGuards(true)(primitive.isString, 'string');
		});
		it('guards against non-strings', function () {
			assertGuards(false)(primitive.isString, 7);
			assertGuards(false)(primitive.isString, undefined);
			assertGuards(false)(primitive.isString, null);
			assertGuards(false)(primitive.isString, {});
		});
		it('is fast', function () {
			assertBenchGuard(this, primitive.isString, strings, trues);
		}).timeout(10_000);
	});
	context('isFunction', function () {
		it('guards for functions', function () {
			assertGuards(true)(primitive.isFunction, () => undefined);
			assertGuards(true)(primitive.isFunction, async function () {
				return Promise.resolve(true);
			});
		});
		it('guards against non-functions', function () {
			assertGuards(false)(primitive.isFunction, 7);
			assertGuards(false)(primitive.isFunction, undefined);
			assertGuards(false)(primitive.isFunction, null);
			assertGuards(false)(primitive.isFunction, {});
			assertGuards(false)(primitive.isFunction, 'string');
			assertGuards(false)(primitive.isFunction, []);
		});
		it('is fast', function () {
			assertBenchGuard(this, primitive.isFunction, functions, trues);
		}).timeout(10_000);
	});
	context('isUndefined', function () {
		it('guards for undefined', function () {
			assertGuards(true)(primitive.isUndefined, undefined);
			assertGuards(true)(primitive.isUndefined, ({} as any).testProperty);
		});
		it('guards against anything else', function () {
			assertGuards(false)(primitive.isUndefined, 7);
			assertGuards(false)(primitive.isUndefined, '');
			assertGuards(false)(primitive.isUndefined, null);
			assertGuards(false)(primitive.isUndefined, {});
		});
		it('is fast', function () {
			assertBenchGuard(this, primitive.isUndefined, undefineds, trues);
		}).timeout(10_000);
	});
	context('isNull', function () {
		it('guards for null', function () {
			assertGuards(true)(primitive.isNull, null);
		});
		it('guards against anything else', function () {
			assertGuards(false)(primitive.isNull, ({} as any).testProperty);
			assertGuards(false)(primitive.isNull, 7);
			assertGuards(false)(primitive.isNull, '');
			assertGuards(false)(primitive.isNull, undefined);
			assertGuards(false)(primitive.isNull, {});
		});
		it('is fast', function () {
			assertBenchGuard(this, primitive.isNull, nulls, trues);
		}).timeout(10_000);
	});
});
