import {
	objectHasDefinition,
	isLiteral,
	integralInterval,
	thenGuard,
	isObject,
	requiredProperty,
} from '../../src';
import { assertGuards } from '../assertGuards';

const minSec = integralInterval('[', 0)(60, ')');
const degLng = integralInterval('[', 0)(180, ')');
const degLat = integralInterval('[', 0)(90, ')');

type Lat = { degrees: number; minutes: number; seconds: number; heading: 'N' | 'S' };
type Lng = { degrees: number; minutes: number; seconds: number; heading: 'E' | 'W' };
type GeoCoords = { lat: Lat; lng: Lng };

const lat = thenGuard(
	isObject,
	objectHasDefinition<object, Lat>({
		degrees: requiredProperty(degLat),
		minutes: requiredProperty(minSec),
		seconds: requiredProperty(minSec),
		heading: requiredProperty(isLiteral(['N', 'S'])),
	}),
);

const lng = thenGuard(
	isObject,
	objectHasDefinition<object, Lng>({
		degrees: requiredProperty(degLng),
		minutes: requiredProperty(minSec),
		seconds: requiredProperty(minSec),
		heading: requiredProperty(isLiteral(['E', 'W'])),
	}),
);

const geoCoords = objectHasDefinition<object, GeoCoords>({
	lat: requiredProperty(lat),
	lng: requiredProperty(lng),
});

describe('geographic coordinates', function () {
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
	it('accepts good coords', function () {
		assertGuards(true)(geoCoords, goodCoords);
	});
	it('reject invalid coords', function () {
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
