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
	readonly [P in keyof TTuple]: ReasonGuard<unknown, TTuple[P]>;
};

const isArrayOfLength = <TTuple extends unknown[]>(
	lengthGuard: ReasonGuard<number, number>
) => thenGuard<unknown, unknown[], TupleIntermediate<TTuple>>(
	isArray,
	requiredProperty(thenGuard(isNumber, lengthGuard))('length') as NegatableGuard<unknown[], TTuple>,
);

export type TupleGuard<TTuple extends unknown[]> = NegatableGuard<unknown, TTuple> & {
	readonly tupleLength: number;
	readonly isStrict: boolean;
	// technically we could have toStrict/Loose only declared on the specific interfaces,
	// but it's easier to use if they are on the base type
	toStrict(): StrictTupleGuard<TTuple>;
	toLoose(): LooseTupleGuard<TTuple>;
}
export type StrictTupleGuard<TTuple extends unknown[]> = TupleGuard<TTuple> & {
	isStrict: true;
}
export type LooseTupleGuard<TTuple extends unknown[]> = TupleGuard<TTuple> & {
	isStrict: false;
}

export function isTuple<TTuple extends unknown[]>(
	...itemGuards: TupleGuards<TTuple>
): LooseTupleGuard<TTuple> {
	const looseGuard: LooseTupleGuard<TTuple> = Object.assign(
		thenGuard<unknown, TupleIntermediate<TTuple>, TTuple>(
			isArrayOfLength<TTuple>(numberIsAtLeast(itemGuards.length)),
			itemGuards
			.map((guard, idx) => requiredProperty(guard)(idx))
			.reduce(
				(aggGuard, itemGuard) => aggGuard === constantGuards(true) ? itemGuard : andGuard(aggGuard, itemGuard),
				constantGuards(true),
			) as NegatableGuard<TupleIntermediate<TTuple>, TTuple>,
			// ^^^ Typescript needs help because no varaidic types
		),
		{
			tupleLength: itemGuards.length,
			// cast below is needed because otherwise typescript always thinks this is just a boolean
			isStrict: false,
			toStrict: () => {
				const strictGuard: StrictTupleGuard<TTuple> = Object.assign(
					andGuard(
						looseGuard,
						isArrayOfLength(numberIs(looseGuard.tupleLength)),
					),
					{
						tupleLength: looseGuard.tupleLength,
						isStrict: true,
						// already strict, can just return itself
						toStrict: () => strictGuard,
						toLoose: () => looseGuard,
					} as Pick<StrictTupleGuard<TTuple>, 'tupleLength' | 'isStrict' | 'toStrict' | 'toLoose'>,
				);
				return strictGuard;
			},
			toLoose: () => looseGuard,
		} as Pick<LooseTupleGuard<TTuple>, 'tupleLength' | 'isStrict' | 'toStrict' | 'toLoose'>,
	);
	return looseGuard;
};
