import { assertGuards } from './assertGuards';
import { assertBenchGuard } from './benchGuards';
import * as primitive from '../src/primitiveGuards';

describe('primitive guards', function () {
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
			assertBenchGuard(
				this,
				primitive.isNumber,
				() => Math.random(),
				(): unknown => Math.random().toString(),
			);
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
			assertBenchGuard(
				this,
				primitive.isString,
				() => Math.random().toString(),
				(): unknown => Math.random(),
			);
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
			assertBenchGuard(
				this,
				primitive.isFunction,
				() => Math.random,
				(): unknown => true,
			);
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
			assertBenchGuard(
				this,
				primitive.isUndefined,
				() => undefined,
				(): unknown => true,
			);
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
			assertBenchGuard(
				this,
				primitive.isNull,
				() => null,
				(): unknown => true,
			);
		}).timeout(10_000);
	});
});
