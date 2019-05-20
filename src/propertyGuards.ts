import {ReasonGuard} from './ReasonGuard';
import {checkerToGuard} from './Checker';
import {thenGuard} from './Combinators';
import {isNumber, isString, isBoolean, isFunction} from './primitiveGuards';
import {isDate, isArray} from './instanceGuards';
import {arrayHasType} from './arrayHasType';

export const hasProperty =
	<T extends string | number | symbol>(p: T) => checkerToGuard<unknown, { [P in T]: unknown }>((input: unknown) => {
		const x: any = input;
		// if (x[p] === undefined) throw new Error(`property ${p} is undefined`);
		// if (x[p] === null) throw new Error(`property ${p} is null`); // is this right?
		if (!(p in x)) throw new Error(`property ${p} is not present`);
		return `property ${p} is present`;
	});

export const propertyHasType =
	<FROM, TO extends FROM>(itemGuard: ReasonGuard<FROM, TO>) =>
		<T extends string | number | symbol>(p: T) =>
			checkerToGuard<{ [P in T]: FROM }, { [P in T]: TO }>((input: { [P in T]: FROM }) => {
				const innerErrors: Error[] = [];
				const innerConfs: string[] = [];
				if (!itemGuard(input[p], innerErrors, innerConfs)) {
					throw new Error(`property ${p}: ${innerErrors[0].message}`);
				}
				return `property ${p}: ${innerConfs[0]}`;
			});

const propertyIsUndefined =
	<T extends string | number | symbol>(p: T) =>
		checkerToGuard<{[P in T]: unknown}, {[P in T]: undefined}>((input: unknown) => {
			const x: any = input;
			if (x[p] !== undefined) throw new Error(`property ${p} is not undefined`);
			return `property ${p} is undefined`;
		});

const propertyIsNull =
	<T extends string | number | symbol>(p: T) =>
		checkerToGuard<{[P in T]: unknown}, { [P in T]: null }>((input: unknown) => {
			const x: any = input;
			if (x[p] !== null) throw new Error(`property ${p} is not null`);
			return `property ${p} is null`;
		});

export const hasNumberProperty = <T extends string | number | symbol>(p: T) =>
	thenGuard(hasProperty(p), propertyHasType(isNumber)(p));
export const hasStringProperty = <T extends string | number | symbol>(p: T) =>
	thenGuard(hasProperty(p), propertyHasType(isString)(p));
export const hasBooleanProperty = <T extends string | number | symbol>(p: T) =>
	thenGuard(hasProperty(p), propertyHasType(isBoolean)(p));
export const hasFunctionProperty = <T extends string | number | symbol>(p: T) =>
	thenGuard(hasProperty(p), propertyHasType(isFunction)(p));
export const hasDateProperty = <T extends string | number | symbol>(p: T) =>
	thenGuard(hasProperty(p), propertyHasType(isDate)(p));
export const hasUndefinedProperty = <T extends string | number | symbol>(p: T) =>
	thenGuard(hasProperty(p), propertyIsUndefined(p));
export const hasNullProperty = <T extends string | number | symbol>(p: T) =>
	thenGuard(hasProperty(p), propertyIsNull(p));

export const hasArrayProperty =
	<TO>(itemGuard: ReasonGuard<unknown, TO>) =>
		<T extends string | number | symbol>(p: T) =>
			thenGuard(
				thenGuard(hasProperty(p), propertyHasType(isArray)(p)),
				propertyHasType(arrayHasType(itemGuard))(p)
			);
