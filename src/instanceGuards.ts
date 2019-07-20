import {checkerToGuard} from './Checker';

/**
 * @typeparam INST is a generic for the instance type to guard for
 * @param ctor constructor
 * @returns
 * [checkToGuard](#checkertoguard)
 * ### Examples
 * [isDate](#isdate), [isArray](#isarray)
 */
export const getInstanceTypeCheck =
	<INST>(ctor: new(...args: any[]) => INST) =>
		checkerToGuard<unknown, INST>((input: unknown) => {
			if (!(input instanceof ctor)) throw new Error(`not a ${ctor.name}`);
			return `a ${ctor.name}`;
		});


export const isDate = getInstanceTypeCheck(Date);
export const isArray = getInstanceTypeCheck(Array);
