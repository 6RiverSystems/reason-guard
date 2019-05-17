import 'mocha';
import {assertGuards} from './assertGuards';
import * as property from '../src/propertyGuards';
import {ReasonGuard} from '../src';

const values = [0, 'string', false, () => null, new Date(), null, undefined, []];

describe('property guards', function() {
	context('number property', function() {
		testGuardMaker(property.hasNumberProperty, 0);
	});
	context('string property', function() {
		testGuardMaker(property.hasStringProperty, 1);
	});
	context('boolean property', function() {
		testGuardMaker(property.hasBooleanProperty, 2);
	});
	context('function property', function() {
		testGuardMaker(property.hasFunctionProperty, 3);
	});
	context('date property', function() {
		testGuardMaker(property.hasDateProperty, 4);
	});
	context('null property', function() {
		testGuardMaker(property.hasNullProperty, 5);
	});
	context('undefined property', function() {
		testGuardMaker(property.hasUndefinedProperty, 6);
	});
	context('array property', function() {
		// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
		testGuardMaker(property.hasArrayProperty((x): x is unknown => true), 7);
	});
});

function testGuardMaker(
	guardMaker: <T extends string | number | symbol>(p: T) => ReasonGuard<unknown, unknown>, correctIndex: number
) {
	it('guards for correct properties', function() {
		assertGuards(true)(guardMaker('prop'), {prop: values[correctIndex]});
	});
	it('guards against missing properties', function() {
		assertGuards(false)(guardMaker('prop'), {});
		assertGuards(false)(guardMaker('prop'), 3);
		assertGuards(false)(guardMaker('prop'), undefined);
	});
	it('guards against wrong properties', function() {
		for (let i = 0; i < values.length; i++) {
			if (i !== correctIndex) {
				assertGuards(false)(guardMaker('prop'), {prop: values[i]});
			}
		}
	});
}
