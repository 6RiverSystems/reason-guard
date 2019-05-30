import 'mocha';
import {assertGuards} from './assertGuards';
import * as property from '../src/propertyGuards';
import {ReasonGuard, isString, notGuard, isObjectWithDefinition} from '../src';

const values = [0, 'string', false, () => null, new Date(), null, undefined, []];
class TestBase {
	public get prop1() {
		return undefined;
	}
}
class Test extends TestBase {
	public prop2: undefined = undefined;
}

describe('property guards', function() {
	context('required property', function() {
		it('works normally', function() {
			const guard = property.requiredProperty<{foo: string}, 'foo'>('foo', isString);
			assertGuards(true)(guard, {foo: 'foo'});
			assertGuards(false)(guard, {});
			assertGuards(false)(guard, {foo: 3});
		});
		it('works negated', function() {
			const guard = notGuard(property.requiredProperty<{foo: string}, 'foo'>('foo', isString));
			assertGuards(!true)(guard, {foo: 'foo'});
			assertGuards(!false)(guard, {});
			assertGuards(!false)(guard, {foo: 3});
		});
	});
	context('optional property', function() {
		it('works normally', function() {
			const guard = property.optionalProperty<{foo?: string}, 'foo'>('foo', isString);
			assertGuards(true)(guard, {foo: 'foo'});
			assertGuards(true)(guard, {});
			assertGuards(false)(guard, {foo: 3});
		});
		it('works negated', function() {
			const guard = notGuard(property.optionalProperty<{foo?: string}, 'foo'>('foo', isString));
			assertGuards(!true)(guard, {foo: 'foo'});
			assertGuards(!true)(guard, {});
			assertGuards(!false)(guard, {foo: 3});
		});
		it('works nested', function() {
			const guard = isObjectWithDefinition<{foo?: {bar?: string}}>({
				foo: property.optionalProperty('foo', isObjectWithDefinition<{bar?: string}>({
					bar: property.optionalProperty('bar', isString),
				})),
			});
			const negaGuard = notGuard(guard);
			assertGuards(true)(guard, {foo: {bar: 'test'}});
			assertGuards(true)(guard, {foo: {}});
			assertGuards(true)(guard, {});
			assertGuards(false)(guard, {foo: {bar: null}});
			assertGuards(false)(guard, {foo: null});
			assertGuards(false)(guard, null);

			assertGuards(!true)(negaGuard, {foo: {bar: 'test'}});
			assertGuards(!true)(negaGuard, {foo: {}});
			assertGuards(!true)(negaGuard, {});
			assertGuards(!false)(negaGuard, {foo: {bar: null}});
			assertGuards(!false)(negaGuard, {foo: null});
			assertGuards(!false)(negaGuard, null);
		});
	});
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
	context('has property', function() {
		it('guards for present properties', function() {
			assertGuards(true)(property.hasProperty('test'), {test: 3});
			assertGuards(true)(property.hasProperty('test'), {test: undefined});
			assertGuards(true)(property.hasProperty('prop1'), new Test());
			assertGuards(true)(property.hasProperty('prop2'), new Test());
		});
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
