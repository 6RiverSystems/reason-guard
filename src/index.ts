export type ReasonGuard<FROM, TO extends FROM> = (input: FROM, output: Error[], confirmations: string[]) => input is TO;
export type ReasonCheck<FROM> = (input: FROM, output: Error[], confirmations: string[]) => boolean;

export type Checker<FROM> = (input: FROM) => string;

export const checkerToGuard = <(<FROM, TO extends FROM>(checker: Checker<FROM>) =>
	ReasonGuard<FROM, TO>)>((checker) => (input, e, c) => {
		try {
			c.push(checker(input));
			return true;
		} catch (err) {
			e.push(err);
			return false;
		}
	});

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

export const arrayHasType =
	<TO>(itemGuard: ReasonGuard<unknown, TO>) =>
		checkerToGuard<unknown[], TO[]>((input: unknown[]) => {
			for (let i = 0; i < input.length; i++) {
				const innerErrors: Error[] = [];
				const innerConfs: string[] = [];
				if (!itemGuard(input[i], innerErrors, innerConfs)) {
					throw new Error(`element ${i}: ${innerErrors[0].message}`);
				}
			}
			return `is array of expected type`;
		});

export const propertyIsUndefined =
	<T extends string | number | symbol>(p: T) => checkerToGuard<unknown, { [P in T]?: undefined }>((input: unknown) => {
		const x: any = input;
		if (x[p] !== undefined) throw new Error(`property ${p} is not undefined`);
		return `property ${p} is undefined`;
	});

export const propertyIsNull =
	<T extends string | number | symbol>(p: T) => checkerToGuard<unknown, { [P in T]: null }>((input: unknown) => {
		const x: any = input;
		if (x[p] !== null) throw new Error(`property ${p} is not null`);
		return `property ${p} is null`;
	});

type Primitive = 'string'|'number'|'bigint'|'boolean'|'symbol'|'undefined'|'object'|'function';
// Dangerous -- do not export!
// We cannot guarantee that "x: PRIM" -> "typeof x === 'prim'"!
function getPrimitiveTypeCheck<PRIM>(prim: Primitive) {
	return checkerToGuard<unknown, PRIM>((input: unknown) => {
		if (typeof input !== prim) throw new Error(`not a ${prim}`);
		return `a ${prim}`;
	});
}

const getInstanceTypeCheck =
	<INST>(ctor: new(...args: any[]) => INST) =>
		checkerToGuard<unknown, INST>((input: unknown) => {
			if (!(input instanceof ctor)) throw new Error(`not a ${ctor.name}`);
			return `a ${ctor.name}`;
		});

export const isNumber = getPrimitiveTypeCheck<number>('number');
export const isString = getPrimitiveTypeCheck<string>('string');
export const isBoolean = getPrimitiveTypeCheck<boolean>('boolean');
export const isFunction = getPrimitiveTypeCheck<Function>('function');
export const isDate = getInstanceTypeCheck(Date);
export const isArray = getInstanceTypeCheck(Array);

export const thenGuard =
	<(<FROM, MID extends FROM, TO extends MID>(left: ReasonGuard<FROM, MID>, right: ReasonGuard<MID, TO>) =>
		ReasonGuard<FROM, TO>)>((left, right) => {
			return (input, output, confirmations) => {
				return left(input, output, confirmations) && right(input, output, confirmations);
			};
		});

export const andGuard =
<(<FROM, LEFT extends FROM, RIGHT extends FROM>(left: ReasonGuard<FROM, LEFT>, right: ReasonGuard<FROM, RIGHT>) =>
ReasonGuard<FROM, LEFT&RIGHT>)>((left, right) => {
	return (input, output, confirmations) => {
		return left(input, output, confirmations) && right(input, output, confirmations);
	};
});

export const notGuard =
	<(<FROM, TO extends FROM>(inner: ReasonGuard<FROM, TO>) =>
		ReasonGuard<FROM, Exclude<FROM, TO>>)>((inner) => {
			return (input, output, confirmations) => {
				try {
					const innerErrors: Error[] = [];
					const innerConfs: string[] = [];
					if (inner(input, innerErrors, innerConfs)) {
						throw new Error(innerConfs[0]);
					} else {
						confirmations.push(innerErrors[0].message);
						return true;
					}
				} catch (err) {
					output.push(err);
					return false;
				}
			};
		});

export const orGuard =
	<(<FROM, TO extends FROM>(left: ReasonGuard<FROM, TO>, right: ReasonGuard<FROM, TO>) =>
	ReasonGuard<FROM, TO>)>((left, right) => {
		return (input, output, confirmations) => {
			try {
				const innerErrors: Error[] = [];
				const innerConfs: string[] = [];
				if (left(input, innerErrors, innerConfs)) {
					confirmations.push(innerConfs[0]);
					return true;
				}
				innerConfs.splice(0);
				if (right(input, innerErrors, innerConfs)) {
					confirmations.push(innerConfs[0]);
					return true;
				}
				throw new Error(`${innerErrors[0].message}, and ${innerErrors[1].message}`);
			} catch (err) {
				output.push(err);
				return false;
			}
		};
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

export const hasArrayProperty =
	<TO>(itemGuard: ReasonGuard<unknown, TO>) =>
		<T extends string | number | symbol>(p: T) =>
			thenGuard(
				thenGuard(hasProperty(p), propertyHasType(isArray)(p)),
				propertyHasType(arrayHasType(itemGuard))(p)
			);
