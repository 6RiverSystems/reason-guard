import { assert } from 'chai';

import { assertGuards } from './assertGuards';
import { isString, isNumber, isDate, ReasonGuard } from '../src';
import { isTuple, TupleGuard } from '../src/tupleGuards';

// half the point of this spec file is to verify it compiles cleanly
// sadly there are some negative tests of that sort we'd like to have, but can't do that with mocha

describe('tupleGuards', function () {
	const testValues = ['', 0, new Date(), Symbol('test'), [], {}, true, false];

	// explicit typing on this one is to ensure the mapped types are working
	const guard2: TupleGuard<[string, number]> = isTuple(isString, isNumber);
	const guard3 = isTuple(isString, isNumber, isDate);

	const guard2Good: unknown[] = ['', 0];
	const guard3Good: unknown[] = [...guard2Good, new Date()];

	context('isTuple', function () {
		it('defaults to being a loose guard', function () {
			assert.propertyVal(guard2, 'isStrict', false);
			assert.propertyVal(guard3, 'isStrict', false);
			assert.strictEqual(guard2.toLoose(), guard2);
			assert.strictEqual(guard3.toLoose(), guard3);
		});
		it('guards for valid tuples of the expected length', function () {
			assertGuards(true)(guard2, guard2Good);
			assertGuards(true)(guard3, guard3Good);
		});
		it('guards for valid tuples with extra items', function () {
			testValues.forEach((v) => {
				assertGuards(true)(guard2, [...guard2Good, v]);
				assertGuards(true)(guard3, [...guard3Good, v]);
			});
		});
		it('guards against too short tuples', function () {
			[
				{ guard: guard2, good: guard2Good },
				{ guard: guard3, good: guard3Good },
			].forEach(({ guard, good }) => {
				for (let i = 0; i < good.length; ++i) {
					const bad = [...good].splice(i, 1);
					assertGuards(false)(guard as ReasonGuard<unknown, unknown[]>, bad);
				}
			});
		});
		it('guards against tuples with proper length but wrong element types', function () {
			[
				{ guard: guard2, good: guard2Good },
				{ guard: guard3, good: guard3Good },
			].forEach(({ guard, good }) => {
				for (let i = 0; i < good.length; ++i) {
					for (let j = 0; j < testValues.length; ++j) {
						if (typeof good[i] === typeof testValues[j]) {
							continue;
						}
						const bad = [...good].splice(i, 1, testValues[j]);
						assertGuards(false)(guard as ReasonGuard<unknown, unknown[]>, bad);
					}
				}
			});
		});
	});

	context('isStrictTuple', function () {
		const guard2Strict = guard2.toStrict();
		const guard3Strict = guard3.toStrict();
		it('makes a strict guard via toStrict', function () {
			assert.propertyVal(guard2Strict, 'isStrict', true);
			assert.propertyVal(guard3Strict, 'isStrict', true);
			assert.strictEqual(guard2Strict.toStrict(), guard2Strict);
			assert.strictEqual(guard3Strict.toStrict(), guard3Strict);
			assert.strictEqual(guard2Strict.toLoose(), guard2);
			assert.strictEqual(guard3Strict.toLoose(), guard3);
		});
		it('guards for good tuples of the right length', function () {
			assertGuards(true)(guard2Strict, guard2Good);
			assertGuards(true)(guard3Strict, guard3Good);
		});
		it('guards against tuples of the wrong length', function () {
			assertGuards(false)(guard2Strict, guard3Good);
			assertGuards(false)(guard3Strict, guard2Good);
			testValues.forEach((v) => {
				assertGuards(false)(guard2Strict, [...guard2Good, v]);
				assertGuards(false)(guard3Strict, [...guard3Good, v]);
			});
			[
				{ guard: guard2Strict, good: guard2Good },
				{ guard: guard3Strict, good: guard3Good },
			].forEach(({ guard, good }) => {
				for (let i = 0; i < good.length; ++i) {
					const bad = [...good].splice(i, 1);
					assertGuards(false)(guard as ReasonGuard<unknown, unknown[]>, bad);
				}
			});
		});
	});
});
