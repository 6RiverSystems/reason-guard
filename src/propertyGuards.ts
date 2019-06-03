import {ReasonGuard} from './ReasonGuard';
import {checkerToGuard} from './Checker';
import {thenGuard, orGuard, notGuard} from './Combinators';
import {isUndefined} from './primitiveGuards';
import {isArrayOfType} from './arrayHasType';
import {NegatableGuard} from './NegatableGuard';

export type PropertyGuard<DEST_PROP_TYPE> =
<T extends string | number | symbol>(p: T) =>
NegatableGuard<unknown, Record<T, DEST_PROP_TYPE>>;

export type StrictOptionalPropertyGuard<DEST_PROP_TYPE> =
<T extends string | number | symbol>(p: T) =>
NegatableGuard<unknown, Partial<Record<T, DEST_PROP_TYPE>>>;

export type OptionalPropertyGuard<DEST_PROP_TYPE> = StrictOptionalPropertyGuard<DEST_PROP_TYPE|undefined>;

export type NarrowPropertyGuard<
	FROM_PROP_TYPE,
	DEST_PROP_TYPE extends FROM_PROP_TYPE = FROM_PROP_TYPE
> = <T extends string | number | symbol>(p: T) =>
NegatableGuard<Record<T, FROM_PROP_TYPE>, Record<T, DEST_PROP_TYPE>>;

export const hasProperty =
	<T extends string | number | symbol>
	(p: T) => checkerToGuard<unknown, Record<T, unknown>, Partial<Record<T, never>> >((input: unknown) => {
		const x: any = input;
		// if (x[p] === undefined) throw new Error(`property ${p} is undefined`);
		// if (x[p] === null) throw new Error(`property ${p} is null`); // is this right?
		if (!(p in x)) throw new Error(`property ${p} is not present`);
		return `property ${p} is present`;
	});

export const propertyHasType =
	<FROMT, T extends string|number|symbol, TOT extends FROMT, TO extends Record<T, TOT>>
	(itemGuard: ReasonGuard<FROMT, TOT>, p: T) =>
		checkerToGuard<Record<T, FROMT>, Pick<TO, T>>((input) => {
			const innerErrors: Error[] = [];
			const innerConfs: string[] = [];
			if (!itemGuard(input[p], innerErrors, innerConfs)) {
				throw new Error(`property ${p}: ${innerErrors[0].message}`);
			}
			return `property ${p}: ${innerConfs[0]}`;
		});

export const narrowedProperty =
<FROM_PROP_TYPE, TO_PROP_TYPE extends FROM_PROP_TYPE>
	(g: ReasonGuard<FROM_PROP_TYPE, TO_PROP_TYPE>): NarrowPropertyGuard<FROM_PROP_TYPE, TO_PROP_TYPE> =>
		<T extends string | number | symbol>(p: T):
	NegatableGuard<Record<T, FROM_PROP_TYPE>, Record<T, TO_PROP_TYPE>> =>
			propertyHasType(g, p);

export const requiredProperty =
<TO_PROP_TYPE>(g: ReasonGuard<unknown, TO_PROP_TYPE>): PropertyGuard<TO_PROP_TYPE> =>
		<T extends string | number | symbol>(p: T):
	NegatableGuard<unknown, Record<T, TO_PROP_TYPE>> =>
			thenGuard(hasProperty(p), propertyHasType(g, p));

export const optionalProperty =
<PTYPE>(g: ReasonGuard<unknown, PTYPE>): OptionalPropertyGuard<PTYPE> =>
	<T extends string | number | symbol>(p: T):
	NegatableGuard<unknown, Partial<Record<T, PTYPE|undefined>>> =>
			orGuard(
				notGuard(hasProperty(p)),
				orGuard(
					requiredProperty(isUndefined)(p),
					requiredProperty(g)(p)
				)
			);

export const strictOptionalProperty =
<PTYPE>(g: ReasonGuard<unknown, PTYPE>): StrictOptionalPropertyGuard<PTYPE> =>
<T extends string | number | symbol>(p: T):
NegatableGuard<unknown, Partial<Record<T, PTYPE>>> =>
			orGuard(
				notGuard(hasProperty(p)),
				requiredProperty(g)(p)
			);

export const hasArrayProperty =
<T extends string | number | symbol, TO>
	(itemGuard: ReasonGuard<unknown, TO>) =>
		(p: T): NegatableGuard<unknown, Record<T, TO[]>> =>
			thenGuard(hasProperty(p), propertyHasType(isArrayOfType(itemGuard), p));
