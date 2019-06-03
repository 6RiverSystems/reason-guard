import {ReasonGuard} from './ReasonGuard';
import {thenGuard} from './Combinators';
import {isObject} from './primitiveGuards';

// NOTE: for this one you HAVE to have K as a parameter
// if you move `keyof FROM` into the mapping, the result of this type is `any`
/**
 * Fields in `FROM` that are narrowed in `TO`
 */
type NarrowedFields<FROM, TO extends FROM, K extends keyof FROM = keyof FROM> = {
	[P in K]: FROM[P] extends TO[P] ? never : P;
}[K] & keyof TO;
/**
 * Fields in `TO` that don't exist in `FROM`
 */
type ExtendedFields<FROM, TO extends FROM> = Exclude<keyof TO, keyof FROM> & keyof TO;

export type NarrowedGuards<FROM extends object, TO extends FROM> = {
	[P in NarrowedFields<FROM, TO>]: (p: P) => ReasonGuard<Pick<FROM, P>, Pick<TO, P>>
}

export type ExtendedGuards<FROM, TO extends FROM> = {
	[P in ExtendedFields<FROM, TO>]: (p: P) => ReasonGuard<unknown, Pick<TO, P>>;
}

export type PropertyGuards<FROM extends object, TO extends FROM> = NarrowedGuards<FROM, TO> & ExtendedGuards<FROM, TO>;

/**
 * Fields in `TO` that are different (type or presence) in `FROM`
 */
export type ChangedFields<FROM extends object, TO extends FROM> = keyof PropertyGuards<FROM, TO> & keyof TO;

function checkDefinition<FROM extends object, TO extends FROM>(
	definition: PropertyGuards<FROM, TO>, input: FROM, output: Error[], confirmations: string[],
): input is TO {
	let anyPassed = false;
	let anyFailed = false;
	const narrowHalf: NarrowedGuards<FROM, TO> = definition;
	const extendHalf: ExtendedGuards<FROM, TO> = definition;

	function checkNarrow<K extends NarrowedFields<FROM, TO>>(k: K) {
		if (narrowHalf[k](k)(input, output, confirmations)) {
			anyPassed = true;
		} else {
			anyFailed = true;
		}
	}
	function checkExtend<K extends ExtendedFields<FROM, TO>>(k: K) {
		if (extendHalf[k](k)(input, output, confirmations)) {
			anyPassed = true;
		} else {
			anyFailed = true;
		}
	}

	function checkProperty<K extends ChangedFields<FROM, TO>>(k: K) {
		if (k in input) {
			const fromKey: NarrowedFields<FROM, TO> = k as any; // Can't prove this to TS :(
			checkNarrow(fromKey);
		} else {
			const fromKey: ExtendedFields<FROM, TO> = k as any; // Can't prove this to TS :(
			checkExtend(fromKey);
		}
	}

	// if k in keyof FROM, then hasProperty is redundant, but that's not something we can express here
	// TODO: we could cache these property lists for performance
	(Object.getOwnPropertyNames(definition) as (keyof typeof definition)[]).forEach(checkProperty);
	// repeat!
	(Object.getOwnPropertySymbols(definition) as (keyof typeof definition)[]).forEach(checkProperty);

	if (!anyPassed && !anyFailed) {
		try {
			throw new Error('definition had no guards');
		} catch (err) {
			output.push(err);
			return false;
		}
	}
	return !anyFailed;
}

// this would save typing, but can't figure out how to use it below (syntax-wise)
// type PropertyGuardBuilder<FROM, TO extends FROM> = (definition: PropertyGuards<FROM, TO>) => ReasonGuard<FROM, TO>;

export const objectHasDefinition =
	<(<FROM extends object, TO extends FROM>(definition: PropertyGuards<FROM, TO>) => ReasonGuard<FROM, TO>)>(
		(definition) =>
			(input, output = [], confirmations = []) => checkDefinition(definition, input, output, confirmations)
	);

export const isObjectWithDefinition =
	<TO extends object>(definition: PropertyGuards<object, TO>) => thenGuard<unknown, object, TO>(
		isObject,
		objectHasDefinition(definition)
	);
