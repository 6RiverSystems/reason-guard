import { assert } from 'chai';

import { ErrorLike, isBoolean, isNumberString, isString, thenGuard } from '../src';
import { isRecord } from '../src/recordGuards';
import { assertGuards } from './assertGuards';

const trueGuard = (_: unknown): _ is unknown => true;

describe(isRecord.name, function () {
	context('key checks', function () {
		const keyGuard = thenGuard(isString, isNumberString);
		const guard = isRecord(keyGuard, trueGuard);

		it('reports bad keys', function () {
			assertGuards(false)(guard, { foo: true });
			assertGuards(false)(guard, { '12': true, foo: true });
			// this symbol would be valid if it was stringified
			assertGuards(false)(guard, { [Symbol('12')]: true });
		});

		it('accepts good keys', function () {
			assertGuards(true)(guard, { '12': true });
		});

		it('reports bad key errors with correct context', function () {
			const errors: ErrorLike[] = [];
			guard({ foo: true }, errors);
			assert.lengthOf(errors, 1);
			assert.include(JSON.stringify(errors[0]), 'key foo: is not ');
		});

		it('confirms good keys with correct context', function () {
			const confirmations: string[] = [];
			guard({ '12': true }, undefined, confirmations);
			// two confirms from isObject, two from the key
			assert.lengthOf(confirmations, 4);
			for (const c of confirmations.slice(2)) {
				assert.include(c, 'key 12: ');
			}
		});
	});

	context('value checks', function () {
		const guard = isRecord(isString, isBoolean);

		it('reports bad values', function () {
			assertGuards(false)(guard, { foo: 0 });
			assertGuards(false)(guard, { foo: 0, bar: true });
		});

		it('accepts good values', function () {
			assertGuards(true)(guard, { bar: true });
		});

		it('reports bad value errors with correct context', function () {
			const errors: ErrorLike[] = [];
			guard({ foo: 0 }, errors);
			assert.lengthOf(errors, 1);
			assert.include(JSON.stringify(errors[0]), 'value foo: not ');
		});

		it('confirms good values with correct context', function () {
			const confirmations: string[] = [];
			guard({ foo: true }, undefined, confirmations);
			// two confirms from isObject, one from the key, one from the value
			assert.lengthOf(confirmations, 4);
			for (const c of confirmations.slice(3)) {
				assert.include(c, 'value foo: ');
			}
		});
	});

	context('nesting', function () {
		const innerGuard = isRecord(isString, isBoolean);
		const outerGuard = isRecord(isString, innerGuard);

		it('provides correct nested error context', function () {
			const errors: ErrorLike[] = [];
			outerGuard({ foo: { bar: 0 } }, errors);
			assert.lengthOf(errors, 1);
			assert.include(JSON.stringify(errors[0]), 'value foo: value bar: not ');
		});
	});
});
