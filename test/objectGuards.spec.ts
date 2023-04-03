import { assertGuards } from './assertGuards';
import {
	ReasonGuard,
	objectHasDefinition,
	isString,
	ChangedFields,
	isLiteral,
	requiredProperty,
	optionalProperty,
	narrowedProperty,
	isObjectWithDefinition,
	strictOptionalProperty,
	isNumberString,
} from '../src';

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
};
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
};

const commonValues = [0, 'string', false, () => null, new Date(), null, undefined, []];

function testPropertyBadValues<FROM extends object, MID extends FROM, TO extends FROM>(
	guard: ReasonGuard<FROM, TO>,
	base: FROM | MID,
	prop: ChangedFields<FROM, TO>,
	correctIndex: number,
	values: any[] = commonValues,
) {
	for (let i = 0; i < values.length; ++i) {
		if (i !== correctIndex) {
			it(`fails if ${prop} has bad value ${values[i]}`, function () {
				assertGuards(false)(guard, { ...base, [prop]: values[i] });
			});
		}
	}
}

function testPropertyGoodValues<FROM extends object, TO extends FROM>(
	guard: ReasonGuard<FROM, TO>,
	base: FROM,
	prop: ChangedFields<FROM, TO>,
	values: any[],
) {
	for (let i = 0; i < values.length; ++i) {
		it(`passes if ${prop} has good value ${values[i]}`, function () {
			assertGuards(true)(guard, { ...base, [prop]: values[i] });
		});
	}
}

describe(isObjectWithDefinition.name, function () {
	context('double-optional nesting', function () {
		const guard = isObjectWithDefinition<{ a?: { b?: string } }>({
			a: optionalProperty(
				isObjectWithDefinition<{ b?: string }>({
					b: optionalProperty(isString),
				}),
			),
		});
		const strictGuard = isObjectWithDefinition<{ a?: { b?: string } }>({
			a: strictOptionalProperty(
				isObjectWithDefinition<{ b?: string }>({
					b: strictOptionalProperty(isString),
				}),
			),
		});

		it('guards for proper values', function () {
			assertGuards(true)(guard, { a: { b: '' } });
			assertGuards(true)(guard, { a: {} });
			assertGuards(true)(guard, {});

			assertGuards(true)(strictGuard, { a: { b: '' } });
			assertGuards(true)(strictGuard, { a: {} });
			assertGuards(true)(strictGuard, {});
		});

		it('differentiates strictness for explicit undefined', function () {
			assertGuards(true)(guard, { a: { b: undefined } });
			assertGuards(true)(guard, { a: undefined });

			assertGuards(false)(strictGuard, { a: { b: undefined } });
			assertGuards(false)(strictGuard, { a: undefined });
		});

		it('guards against improper values', function () {
			assertGuards(false)(guard, { a: { b: null } });
			assertGuards(false)(guard, { a: null });
			assertGuards(false)(guard, null);

			assertGuards(false)(strictGuard, { a: { b: null } });
			assertGuards(false)(strictGuard, { a: null });
			assertGuards(false)(strictGuard, null);
		});
	});
});

describe(objectHasDefinition.name, function () {
	context('simple extension', function () {
		const guard = objectHasDefinition<SimpleBase, SimpleExtended>({
			b: requiredProperty(isString),
		});

		it('detects missing extension property', function () {
			assertGuards(false)(guard, { a: 'foo' });
		});
		testPropertyBadValues(guard, { a: 'foo' }, 'b', 1);
		testPropertyGoodValues(guard, { a: 'foo' }, 'b', ['foo', 'xyzzy']);
	});

	context('optional semantic narrowing', function () {
		const guard = objectHasDefinition<SimpleBase, SimpleExtended>({
			a: narrowedProperty(isNumberString),
			b: requiredProperty(isString),
		});

		it('fails on things with wrong semantics', function () {
			assertGuards(false)(guard, { a: 'foo', b: 'bar' });
		});
		it('succeeds on things with proper semantics', function () {
			assertGuards(true)(guard, { a: '7', b: 'foo' });
		});
	});

	context('explicit choice not to add semantics', function () {
		const guard = objectHasDefinition<SimpleBase, SimpleExtended>({
			a: undefined,
			b: requiredProperty(isString),
		});

		it('detects missing extension property', function () {
			assertGuards(false)(guard, { a: 'foo' });
		});
		testPropertyBadValues(guard, { a: 'foo' }, 'b', 1);
		testPropertyGoodValues(guard, { a: 'foo' }, 'b', ['foo', 'xyzzy']);
	});

	context('simple narrowing', function () {
		const guard = objectHasDefinition<SimpleBase, SimpleNarrowed>({
			a: requiredProperty(isLiteral(['foo', 'bar'])),
		});

		testPropertyGoodValues(guard, { a: 'xyzzy' }, 'a', ['foo', 'bar']);
		testPropertyBadValues(guard, { a: 'xyzzy' }, 'a', Number.NaN);
	});

	context('optionality accepting', function () {
		const guard = isObjectWithDefinition<OptionalBase>({
			a: optionalProperty(isString),
		});
		testPropertyGoodValues(guard, {}, 'a', ['foo', undefined]);
		assertGuards(true)(guard, {});
	});

	context('optionality narrowing', function () {
		const guard = objectHasDefinition<OptionalBase, OptionalNarrowed>({
			a: requiredProperty(isString),
		});
		testPropertyGoodValues(guard, {}, 'a', ['foo', 'bar']);
		testPropertyBadValues(guard, {}, 'a', 1);
	});

	context('complex derivation part 1', function () {
		const guard = objectHasDefinition<ComplexBase, ComplexDerived>({
			b: narrowedProperty(
				objectHasDefinition<{ c: string }, { c: string; d: string }>({
					d: requiredProperty(isString),
				}),
			),
			e: requiredProperty(isString),
		});

		// TODO: we want to assert on _why_ most of these tests pass/fail

		it('detects missing new property', function () {
			assertGuards(false)(guard, { a: 'foo', b: { c: 'foo', d: 'foo' } });
		});
		// bad values for new property
		testPropertyBadValues(guard, { a: 'foo', b: { c: 'foo', d: 'foo' } }, 'e', 1);
		it('detects missing nested property', function () {
			assertGuards(false)(guard, { a: 'foo', b: { c: 'foo' }, e: 'foo' });
		});
		// bad values for nested property
		testPropertyBadValues(
			guard,
			{ a: 'foo', b: { c: 'foo' }, e: 'foo' },
			'b',
			1,
			commonValues.map((v) => ({ c: 'foo', d: v })),
		);

		it('accepts good values', function () {
			assertGuards(true)(guard, { a: 'foo', b: { c: 'foo', d: 'foo' }, e: 'foo' });
		});
	});

	context('weird corner cases', function () {
		it('detects no-op guards that made it past the type checker', function () {
			const guard = objectHasDefinition<SimpleBase, SimpleNarrowed>({} as any);
			assertGuards(false)(guard, { a: 'foo' });
		});
	});
});
