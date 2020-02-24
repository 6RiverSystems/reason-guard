import { arrayFilterGuard, isString } from '../src';
import { assert } from 'chai';

describe('arrayFilterGuard', function() {
	const guard = arrayFilterGuard(isString);
	it('works as a filter function and does not mutate input', function() {
		const junk = ['foo', 'bar', 1, 2];
		const junkClone = [...junk];

		const strings = junk.filter(guard);
		assert.deepEqual(strings, ['foo', 'bar']);
		assert.deepEqual(junk, junkClone);
	});
});
