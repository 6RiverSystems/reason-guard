import {
	isUndefined,
	ReasonGuard,
	objectHasDefinition,
	isString,
	ChangedFields,
	isLiteral,
	orGuard,
	requiredProperty,
	optionalProperty,
	narrowedProperty,
	isObjectWithDefinition,
} from '../src';
import {assertGuards} from './assertGuards';

// NOTE: half of the testing here is just making sure this file compiles without errors

type SimpleBase = {
	a: string;
};
type SimpleExtended = {
	a: string;
	b: string;
};
type SimpleNarrowed = {
	a: 'foo' | 'bar';
}
type ComplexBase = {
	a: string;
	b: {
		c: string;
	};
};
type ComplexDerived = {
	a: string;
	b: {
		c: string;
		d: string;
	};
	e: string;
};

type OptionalBase = {
	a?: string;
};
type OptionalNarrowed = {
	a: string;
}

const commonValues = [0, 'string', false, () => null, new Date(), null, undefined, []];

function testPropertyBadValues<FROM, MID extends FROM, TO extends FROM>(
	guard: ReasonGuard<FROM, TO>,
	base: FROM | MID,
	prop: ChangedFields<FROM, TO>,
	correctIndex: number,
	values: any[] = commonValues
) {
	for (let i = 0; i < values.length; ++i) {
		if (i !== correctIndex) {
			it(`fails if ${prop} has bad value ${values[i]}`, function() {
				assertGuards(false)(guard, {...base, [prop]: values[i]});
			});
		}
	}
}

function testPropertyGoodValues<FROM, TO extends FROM>(
	guard: ReasonGuard<FROM, TO>,
	base: FROM,
	prop: ChangedFields<FROM, TO>,
	values: any[]
) {
	for (let i = 0; i < values.length; ++i) {
		it(`passes if ${prop} has good value ${values[i]}`, function() {
			assertGuards(true)(guard, {...base, [prop]: values[i]});
		});
	}
}

describe(objectHasDefinition.name, function() {
	context('simple extension', function() {
		const guard = objectHasDefinition<SimpleBase, SimpleExtended>({
			b: requiredProperty('b', isString),
		});

		it('detects missing extension property', function() {
			assertGuards(false)(guard, {a: 'foo'});
		});
		testPropertyBadValues(guard, {a: 'foo'}, 'b', 1);
		testPropertyGoodValues(guard, {a: 'foo'}, 'b', ['foo', 'xyzzy']);
	});

	context('simple narrowing', function() {
		const guard = objectHasDefinition<SimpleBase, SimpleNarrowed>({
			a: requiredProperty('a', isLiteral(['foo', 'bar'])),
		});

		testPropertyGoodValues(guard, {a: 'xyzzy'}, 'a', ['foo', 'bar']);
		testPropertyBadValues(guard, {a: 'xyzzy'}, 'a', Number.NaN);
	});

	context('optionality accepting', function() {
		const guard = isObjectWithDefinition<OptionalBase>({
			a: optionalProperty('a', orGuard(isString, isUndefined)),
		});
		testPropertyGoodValues<unknown, OptionalBase>(guard, {}, 'a', ['foo', undefined]);
		assertGuards(true)(guard, {});
	});

	context('optionality narrowing', function() {
		const guard = objectHasDefinition<OptionalBase, OptionalNarrowed>({
			a: requiredProperty('a', isString),
		});
		testPropertyGoodValues(guard, {}, 'a', ['foo', 'bar']);
		testPropertyBadValues(guard, {}, 'a', 1);
	});

	context('complex derivation part 1', function() {
		const guard = objectHasDefinition<ComplexBase, ComplexDerived>({
			b: narrowedProperty<ComplexBase, 'b', ComplexDerived>('b', objectHasDefinition({
				d: requiredProperty('d', isString),
			})),
			e: requiredProperty('e', isString),
		});

		// TODO: we want to assert on _why_ most of these tests pass/fail

		it('detects missing new property', function() {
			assertGuards(false)(guard, {a: 'foo', b: {c: 'foo', d: 'foo'}});
		});
		// bad values for new property
		testPropertyBadValues(guard, {a: 'foo', b: {c: 'foo', d: 'foo'}}, 'e', 1);
		it('detects missing nested property', function() {
			assertGuards(false)(guard, {a: 'foo', b: {c: 'foo'}, e: 'foo'});
		});
		// bad values for nested property
		testPropertyBadValues(guard, {a: 'foo', b: {c: 'foo'}, e: 'foo'}, 'b', 1,
			commonValues.map((v) => ({c: 'foo', d: v})));

		it('accepts good values', function() {
			assertGuards(true)(guard, {a: 'foo', b: {c: 'foo', d: 'foo'}, e: 'foo'});
		});
	});

	context('weird corner cases', function() {
		it('detects no-op guards that made it past the type checker', function() {
			const guard = objectHasDefinition<SimpleBase, SimpleNarrowed>({} as any);
			assertGuards(false)(guard, {a: 'foo'});
		});
	});
});
