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
}[K];
/**
 * Fields in `TO` that don't exist in `FROM`
 */
type ExtendedFields<FROM, TO extends FROM> = Exclude<keyof TO, keyof FROM>;

/**
 * Fields in `TO` that are different (type or presence) in `FROM`
 */
export type ChangedFields<FROM extends object, TO extends FROM> = NarrowedFields<FROM, TO>|ExtendedFields<FROM, TO>;

/**
 * A function from property name to guard on that property
 */
type PropertyGuardFactory<
	FROM extends object,
	TO extends FROM,
	P extends keyof TO
> =
	(p: P) => ReasonGuard<Pick<FROM, P&keyof FROM>, Pick<TO, P>>;

export type RequiredGuards<FROM extends object, TO extends FROM, K extends keyof TO = ChangedFields<FROM, TO>> = {
	[P in K]: PropertyGuardFactory<FROM, TO, P>
}

export type OptionalGuards<FROM extends object, TO extends FROM> = Partial<RequiredGuards<FROM, TO, keyof TO>>;

/**
 *	A mapping from property names to factories for guards on those properties
 */
export type PropertyGuards<FROM extends object, TO extends FROM> = RequiredGuards<FROM, TO> & OptionalGuards<FROM, TO>;

function checkDefinition<FROM extends object, TO extends FROM>(
	definition: PropertyGuards<FROM, TO>, input: FROM, output: Error[], confirmations: string[],
): input is TO {
	let anyPassed = false;
	let anyFailed = false;

	// Here be dragons
	// While typescript accepts this done in pieces,
	// it won't accept it as a one-liner.
	const unifiedDefs: OptionalGuards<FROM, TO> = definition;

	function checkProperty<K extends keyof TO>(k: K) {
		const propertyDefinition = unifiedDefs[k];
		if (propertyDefinition) {
			if (propertyDefinition(k)(input, output, confirmations)) {
				anyPassed = true;
			} else {
				anyFailed = true;
			}
		}
	}

	// if k in keyof FROM, then hasProperty is redundant, but that's not something we can express here
	// TODO: we could cache these property lists for performance
	(Object.getOwnPropertyNames(definition) as (keyof TO)[]).forEach(checkProperty);
	// repeat!
	(Object.getOwnPropertySymbols(definition) as (keyof TO)[]).forEach(checkProperty);

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
