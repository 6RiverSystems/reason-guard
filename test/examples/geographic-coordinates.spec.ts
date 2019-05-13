import {assertGuards} from '../assertGuards';
import {objectHasDefinition, isLiteral, integralInterval} from '../../src';

const minSec = integralInterval('[', 0)(60, ']');

const degLng = integralInterval('[', 0)(180, ']');
const degLat = integralInterval('[', 0)(90, ']');

const lat = objectHasDefinition({
	degrees: degLat,
	minutes: minSec,
	seconds: minSec,
	heading: isLiteral(['N', 'S']),
});

const lng = objectHasDefinition({
	degrees: degLng,
	minutes: minSec,
	seconds: minSec,
	heading: isLiteral(['E', 'W']),
});

const geoCoords = objectHasDefinition({
	lat,
	lng,
});

describe('geographic coordinates', function() {
	const goodCoords = {
		lat: {
			degrees: 30,
			minutes: 12,
			seconds: 15,
			heading: 'N',
		},
		lng: {
			degrees: 150,
			minutes: 12,
			seconds: 15,
			heading: 'E',
		},
	};
	it('accepts good coords', function() {
		assertGuards(true)(geoCoords, goodCoords);
	});
	it('reject invalid coords', function() {
		let test = Object.assign({}, goodCoords);
		test.lat.degrees = 150;
		assertGuards(false)(geoCoords, test);

		test = Object.assign({}, goodCoords);
		test.lng.degrees = -1;
		assertGuards(false)(geoCoords, test);

		test = Object.assign({}, goodCoords);
		test.lat.minutes = 22.5;
		assertGuards(false)(geoCoords, test);

		test = Object.assign({}, goodCoords);
		test.lng.heading = 'e';
		assertGuards(false)(geoCoords, test);
	});
});
