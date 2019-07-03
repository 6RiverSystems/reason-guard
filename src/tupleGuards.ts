import {ReasonGuard} from './ReasonGuard';
import {isNumber} from './primitiveGuards';
import {numberIs, numberIsAtLeast} from './restrictingGuards';
import {thenGuard, andGuard} from './Combinators';
import {isArray} from './instanceGuards';
import {requiredProperty} from './propertyGuards';
import {NegatableGuard} from './NegatableGuard';
import {constantGuards} from './constantGuards';

// we can't do variadic types, but we can do some useful pieces, by virtue of homomorphic mapped array types

// typescript needs hints to understand that unknown[] with length 2 => [unknown, unknown]
// and again that [unknown, unknown] with property 0 isString and 1 isNumber => [string, number]
// however it does check that the types match -- if you change isNumber here to something else, tsc will complain

// `P in keyof TTuple` on these two won't mess with the array methods, only the indexes
// see https://github.com/microsoft/TypeScript/pull/26063
type TupleIntermediate<TTuple extends unknown[]> = {
	[P in keyof TTuple]: unknown;
}
type TupleGuards<TTuple extends unknown[]> = {
	[P in keyof TTuple]: ReasonGuard<unknown, TTuple[P]>;
};

const isArrayOfLength = <TTuple extends unknown[]>(
	lengthGuard: ReasonGuard<number, number>
) => thenGuard<unknown, unknown[], TupleIntermediate<TTuple>>(
	isArray,
	requiredProperty(thenGuard(isNumber, lengthGuard))('length') as NegatableGuard<unknown[], TTuple>,
);

export const isTuple =
	<TTuple extends unknown[]>(
		...itemGuards: TupleGuards<TTuple>
	): NegatableGuard<unknown, TTuple> => thenGuard<unknown, TupleIntermediate<TTuple>, TTuple>(
		isArrayOfLength<TTuple>(numberIsAtLeast(itemGuards.length)),
		itemGuards
		.map((guard, idx) => requiredProperty(guard)(idx))
		.reduce(
			(aggGuard, itemGuard) => aggGuard === constantGuards(true) ? itemGuard : andGuard(aggGuard, itemGuard),
			constantGuards(true),
		) as NegatableGuard<TupleIntermediate<TTuple>, TTuple>,
		// ^^^ Typescript needs help because no varaidic types
	);

/**
 * Turn a loose tuple guard into a strict one, i.e. one that no longer accepts extra items.
 *
 * @param tupleGuard Loose pair guard
 * @param length Strict array length to check
 */
export const isStrictTuple = <TArray extends unknown[]>(
	tupleGuard: ReasonGuard<unknown, TArray>,
	// NOTE: the keyof TArray restriction here does not actually work, it just maps to `number`,
	// not to the specific numbers that are valid indexes in TArray
	// but it's written here in the hopes that it will in a future version of typescript
	length: keyof TArray & number,
) => andGuard(
		tupleGuard,
		isArrayOfLength(numberIs(length)),
	);
