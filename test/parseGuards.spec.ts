import { isNumberString, isDateString, isBigIntString } from '../src';
import { assertGuards } from './assertGuards';

describe('parse guards', function() {
	context('number', function() {
		it('guards for numbers', function() {
			assertGuards(true)(isNumberString, '0');
			assertGuards(true)(isNumberString, '-35.07e7');
		});
		it('guards against non-numbers', function() {
			assertGuards(false)(isNumberString, '');
			assertGuards(false)(isNumberString, 'test');
		});
	});
	context('Date', function() {
		it('guards for Dates', function() {
			assertGuards(true)(isDateString, '2011-10-10');
			assertGuards(true)(isDateString, '2011-10-10T14:48:00');
			assertGuards(true)(isDateString, '2011-10-10T14:48:00.000+09:00');
		});
		it('guards against non-Dates', function() {
			assertGuards(false)(isDateString, '');
			assertGuards(false)(isDateString, '17');
			assertGuards(false)(isDateString, 'test');
		});
	});
	context('BigInt', function() {
		it('guards for BigInts', function() {
			assertGuards(true)(isBigIntString, ''); // this is a weird one, but... js ¯\_(ツ)_/¯
			assertGuards(true)(isBigIntString, '-10');
			assertGuards(true)(isBigIntString, '0x1fffffffffffff');
			assertGuards(true)(isBigIntString, '0b11111111111111111111111111111111111111111111111111111');
			assertGuards(true)(
				isBigIntString,
				'0b111111111111111111111111111111111111111111111111111111',
			);
		});
		it('guards against non-BigInts', function() {
			assertGuards(false)(isBigIntString, 'test');
			assertGuards(false)(isBigIntString, '3.7');
			assertGuards(false)(isBigIntString, '3e3');
		});
	});
});
