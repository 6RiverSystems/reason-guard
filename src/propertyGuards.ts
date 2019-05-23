import {ReasonGuard} from './ReasonGuard';
import {checkerToGuard} from './Checker';
import {thenGuard, orGuard, notGuard} from './Combinators';
import {isNumber, isString, isBoolean, isFunction} from './primitiveGuards';
import {isDate} from './instanceGuards';
import {isArrayOfType} from './arrayHasType';

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
	<FROMT, T extends string|number|symbol, TO extends Record<T, FROMT>>(itemGuard: ReasonGuard<FROMT, TO[T]>, p: T) =>
		checkerToGuard<Record<T, FROMT>, Pick<TO, T>>((input) => {
			const innerErrors: Error[] = [];
			const innerConfs: string[] = [];
			if (!itemGuard(input[p], innerErrors, innerConfs)) {
				throw new Error(`property ${p}: ${innerErrors[0].message}`);
			}
			return `property ${p}: ${innerConfs[0]}`;
		});

const propertyIsUndefined =
	<T extends string | number | symbol>(p: T) =>
		checkerToGuard<Record<T, unknown>, Record<T, undefined>>((input: unknown) => {
			const x: any = input;
			if (x[p] !== undefined) throw new Error(`property ${p} is not undefined`);
			return `property ${p} is undefined`;
		});

const propertyIsNull =
	<T extends string | number | symbol>(p: T) =>
		checkerToGuard<Record<T, unknown>, Record<T, null>>((input: unknown) => {
			const x: any = input;
			if (x[p] !== null) throw new Error(`property ${p} is not null`);
			return `property ${p} is null`;
		});

export const narrowedProperty =
<FROM, T extends keyof FROM, TO extends FROM>
	(p: T, g: ReasonGuard<FROM[T], TO[T]>) =>
		propertyHasType(g, p);

export const requiredProperty =
<TO, T extends keyof TO>
	(p: T, g: ReasonGuard<unknown, TO[T]>) =>
		thenGuard<unknown, Record<T, unknown>, Pick<TO, T>>(hasProperty(p), propertyHasType(g, p));

export const optionalProperty =
<TO, T extends keyof TO>
	(p: T, g: ReasonGuard<unknown, TO[T]>) =>
		orGuard(
			notGuard(hasProperty(p)),
			requiredProperty(p, g)
		);

export const hasNumberProperty = <T extends string | number | symbol>(p: T) =>
	thenGuard(hasProperty(p), propertyHasType(isNumber, p));
export const hasStringProperty = <T extends string | number | symbol>(p: T) =>
	thenGuard(hasProperty(p), propertyHasType(isString, p));
export const hasBooleanProperty = <T extends string | number | symbol>(p: T) =>
	thenGuard(hasProperty(p), propertyHasType(isBoolean, p));
export const hasFunctionProperty = <T extends string | number | symbol>(p: T) =>
	thenGuard(hasProperty(p), propertyHasType(isFunction, p));
export const hasDateProperty = <T extends string | number | symbol>(p: T) =>
	thenGuard(hasProperty(p), propertyHasType(isDate, p));
export const hasUndefinedProperty = <T extends string | number | symbol>(p: T) =>
	thenGuard(hasProperty(p), propertyIsUndefined(p));
export const hasNullProperty = <T extends string | number | symbol>(p: T) =>
	thenGuard(hasProperty(p), propertyIsNull(p));
export const hasArrayProperty = <T extends string | number | symbol, TO>
	(itemGuard: ReasonGuard<unknown, TO>) =>
		(p: T) =>
			thenGuard(hasProperty(p), propertyHasType(isArrayOfType(itemGuard), p));
