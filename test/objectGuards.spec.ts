import {ReasonGuard, objectHasDefinition, isString, ChangedFields, isStringLiteral} from '../src';
import {assertGuardFailed, assertGuardConfirmed} from './util';

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
				assertGuardFailed(guard, {...base, [prop]: values[i]});
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
			assertGuardConfirmed(guard, {...base, [prop]: values[i]});
		});
	}
}

describe(objectHasDefinition.name, function() {
	context('simple extension', function() {
		const guard = objectHasDefinition<SimpleBase, SimpleExtended>({
			b: isString,
		});

		it('detects missing extension property', function() {
			assertGuardFailed(guard, {a: 'foo'});
		});
		testPropertyBadValues(guard, {a: 'foo'}, 'b', 1);
		testPropertyGoodValues(guard, {a: 'foo'}, 'b', ['foo', 'xyzzy']);
	});

	context('simple narrowing', function() {
		const guard = objectHasDefinition<SimpleBase, SimpleNarrowed>({
			a: isStringLiteral({foo: true, bar: true}),
		});

		testPropertyGoodValues(guard, {a: 'xyzzy'}, 'a', ['foo', 'bar']);
		testPropertyBadValues(guard, {a: 'xyzzy'}, 'a', Number.NaN);
	});

	context('optionality narrowing', function() {
		const guard = objectHasDefinition<OptionalBase, OptionalNarrowed>({
			a: isString,
		});
		testPropertyGoodValues(guard, {}, 'a', ['foo', 'bar']);
		testPropertyBadValues(guard, {}, 'a', 1);
	});

	context('complex derivation part 1', function() {
		const guard = objectHasDefinition<ComplexBase, ComplexDerived>({
			b: objectHasDefinition({
				d: isString,
			}),
			e: isString,
		});

		// TODO: we want to assert on _why_ most of these tests pass/fail

		it('detects missing new property', function() {
			assertGuardFailed(guard, {a: 'foo', b: {c: 'foo', d: 'foo'}});
		});
		// bad values for new property
		testPropertyBadValues(guard, {a: 'foo', b: {c: 'foo', d: 'foo'}}, 'e', 1);
		it('detects missing nested property', function() {
			assertGuardFailed(guard, {a: 'foo', b: {c: 'foo'}, e: 'foo'});
		});
		// bad values for nested property
		testPropertyBadValues(guard, {a: 'foo', b: {c: 'foo'}, e: 'foo'}, 'b', 1,
			commonValues.map((v) => ({c: 'foo', d: v})));

		it('accepts good values', function() {
			assertGuardConfirmed(guard, {a: 'foo', b: {c: 'foo', d: 'foo'}, e: 'foo'});
		});
	});

	context('weird corner cases', function() {
		it('detects no-op guards that made it past the type checker', function() {
			const guard = objectHasDefinition<SimpleBase, SimpleNarrowed>({} as any);
			assertGuardFailed(guard, {a: 'foo'});
		});
	});
});
