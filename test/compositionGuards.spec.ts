import {assert} from 'chai';
import * as Chance from 'chance';
const chance = new Chance();
import {isDateOrStringyDate} from '../src';

describe('compositionGuards', function() {
	let date: Date;
	beforeEach(function() {
		date = new Date();
	});
	it('should return true for a date', function() {
		assert.isTrue(isDateOrStringyDate(date));
	});
	it('should return true for a stringy date', function() {
		assert.isTrue(isDateOrStringyDate(date.toISOString()));
	});
	it('should return false for a non-date string', function() {
		assert.isFalse(isDateOrStringyDate(chance.word()));
	});
	it('should return false for a number', function() {
		assert.isFalse(isDateOrStringyDate(chance.integer()));
	});
});
