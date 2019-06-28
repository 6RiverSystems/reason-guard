import {assert} from 'chai';

import {isDateOrStringyDate} from '../src';

describe('compositionGuards', function() {
	let date: Date;
	beforeEach(function() {
		date = new Date();
	});
	it('should return true for a date', function() {
		assert.isTrue(isDateOrStringyDate(date));
	});
	it('should return true for a stringyDate date', function() {
		assert.isTrue(isDateOrStringyDate(date.toISOString()));
	});
});
