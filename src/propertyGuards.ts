import {ReasonGuard} from './ReasonGuard';
import {checkerToGuard, pushContext} from './Checker';
import {thenGuard, orGuard, notGuard} from './Combinators';
import {isUndefined} from './primitiveGuards';
import {isArrayOfType} from './arrayHasType';
import {NegatableGuard} from './NegatableGuard';
import {ContextError, CompositeError} from './ContextError';

// TODO: we may have this type defined elsewhere already
export type PropertyKey = string|number|symbol;

export type PropertyGuard<DEST_PROP_TYPE> =
<T extends PropertyKey>(p: T) =>
NegatableGuard<unknown, Record<T, DEST_PROP_TYPE>>;

export type StrictOptionalPropertyGuard<DEST_PROP_TYPE> =
<T extends PropertyKey>(p: T) =>
NegatableGuard<unknown, Partial<Record<T, DEST_PROP_TYPE>>>;

export type OptionalPropertyGuard<DEST_PROP_TYPE> = StrictOptionalPropertyGuard<DEST_PROP_TYPE|undefined>;

export type NarrowPropertyGuard<
	FROM_PROP_TYPE,
	DEST_PROP_TYPE extends FROM_PROP_TYPE = FROM_PROP_TYPE
> = <T extends PropertyKey>(p: T) =>
NegatableGuard<Record<T, FROM_PROP_TYPE>, Record<T, DEST_PROP_TYPE>>;


export const hasProperty =
	<T extends PropertyKey>
	(p: T) =>
		checkerToGuard<unknown, Record<T, unknown>, Partial<Record<T, never>> >(
			(input: unknown, context?: PropertyKey[]) => {
				const x: any = input;
				// if (x[p] === undefined) throw new Error(`property ${p} is undefined`);
				// if (x[p] === null) throw new Error(`property ${p} is null`); // is this right?
				if (!(p in x)) throw new ContextError(`property ${p} is not present`, pushContext(p, context));
				return `property ${p} is present`;
			});

export const propertyHasType =
	<FROMT, T extends string|number|symbol, TOT extends FROMT, TO extends Record<T, TOT>>
	(itemGuard: ReasonGuard<FROMT, TOT>, p: T) =>
		checkerToGuard<Record<T, FROMT>, Pick<TO, T>>((input, context) => {
			const innerErrors: Error[] = [];
			const innerConfs: string[] = [];
			const innerContext = pushContext(p, context);
			if (!itemGuard(input[p], innerErrors, innerConfs, innerContext)) {
				throw new CompositeError(innerErrors.map((err) =>
					new ContextError(`property ${p}: ${err.message}`,
						err instanceof ContextError ? err.context : innerContext)));
			}
			return `property ${p}: ${innerConfs[0]}`;
		});

export const narrowedProperty =
<FROM_PROP_TYPE, TO_PROP_TYPE extends FROM_PROP_TYPE>
	(g: ReasonGuard<FROM_PROP_TYPE, TO_PROP_TYPE>): NarrowPropertyGuard<FROM_PROP_TYPE, TO_PROP_TYPE> =>
		<T extends PropertyKey>(p: T):
	NegatableGuard<Record<T, FROM_PROP_TYPE>, Record<T, TO_PROP_TYPE>> =>
			propertyHasType(g, p);

export const requiredProperty =
<TO_PROP_TYPE>(g: ReasonGuard<unknown, TO_PROP_TYPE>): PropertyGuard<TO_PROP_TYPE> =>
		<T extends PropertyKey>(p: T):
	NegatableGuard<unknown, Record<T, TO_PROP_TYPE>> =>
			thenGuard(hasProperty(p), propertyHasType(g, p));

export const optionalProperty =
<PTYPE>(g: ReasonGuard<unknown, PTYPE>): OptionalPropertyGuard<PTYPE> =>
	<T extends PropertyKey>(p: T):
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
<T extends PropertyKey>(p: T):
NegatableGuard<unknown, Partial<Record<T, PTYPE>>> =>
			orGuard(
				notGuard(hasProperty(p)),
				requiredProperty(g)(p)
			);

export const hasArrayProperty =
<T extends PropertyKey, TO>
	(itemGuard: ReasonGuard<unknown, TO>) =>
		(p: T): NegatableGuard<unknown, Record<T, TO[]>> =>
			thenGuard(hasProperty(p), propertyHasType(isArrayOfType(itemGuard), p));
