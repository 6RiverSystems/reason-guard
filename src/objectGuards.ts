import { thenGuard } from './Combinators';
import { errorLike, ErrorLike, ReasonGuard } from './ReasonGuard';
import { isObject } from './primitiveGuards';

// NOTE: for this one you HAVE to have K as a parameter
// if you move `keyof FROM` into the mapping, the result of this type is `any`
/**
 * Fields in `FROM` that are narrowed in `TO`
 */
type NarrowedFields<FROM, TO extends FROM, K extends keyof FROM = keyof FROM> = {
	[P in K]-?: FROM[P] extends TO[P] ? never : P;
}[K];
/**
 * Fields in `TO` that don't exist in `FROM`
 */
type ExtendedFields<FROM, TO extends FROM> = Exclude<keyof TO, keyof FROM>;

/**
 * Fields in `TO` that are different (type or presence) in `FROM`
 */
export type ChangedFields<FROM extends object, TO extends FROM> =
	| NarrowedFields<FROM, TO>
	| ExtendedFields<FROM, TO>;

/**
 * A function from property name to guard on that property
 */
type PropertyGuardFactory<FROM extends object, TO extends FROM, P extends keyof TO> = (
	p: P,
) => ReasonGuard<Pick<FROM, P & keyof FROM>, Pick<TO, P>>;

export type RequiredGuards<
	FROM extends object,
	TO extends FROM,
	K extends keyof TO = ChangedFields<FROM, TO>,
> = {
	[P in K]-?: PropertyGuardFactory<FROM, TO, P>;
};

export type OptionalGuards<FROM extends object, TO extends FROM> = Partial<
	RequiredGuards<FROM, TO, keyof TO>
>;
/**
 *	A mapping from property names to factories for guards on those properties
 */
export type PropertyGuards<FROM extends object, TO extends FROM> = RequiredGuards<FROM, TO> &
	OptionalGuards<FROM, TO>;

// we can't express this type precisely without a lot of hacks. It would end up
// being a long tuple list of every property in TO. Since it isn't exported, and
// we won't be able to make use of that type information where it is used, we
// skip that part. We don't need the keys being checked to be part of this list,
// because they are embedded in the guards.
type PropertyGuardList<FROM extends object, TO extends FROM> = ReasonGuard<
	FROM,
	FROM & Partial<TO>
>[];

function checkDefinition<FROM extends object, TO extends FROM>(
	definition: PropertyGuardList<FROM, TO>,
	input: FROM,
	output?: ErrorLike[],
	confirmations?: string[],
	context: PropertyKey[] = [],
): input is TO {
	let anyPassed = false;
	let anyFailed = false;

	for (let i = 0; i < definition.length; ++i) {
		if (definition[i](input, output, confirmations, context)) {
			anyPassed = true;
		} else {
			anyFailed = true;
		}
	}

	if (!anyPassed && !anyFailed) {
		output?.push(errorLike('definition had no guards'));
		return false;
	}
	return !anyFailed;
}

function instantiatePropertyGuards<FROM extends object, TO extends FROM>(
	definition: PropertyGuards<FROM, TO>,
): PropertyGuardList<FROM, TO> {
	const instantiated: PropertyGuardList<FROM, TO> = [];
	const unified: OptionalGuards<FROM, TO> = definition;
	for (const key of Object.getOwnPropertyNames(definition) as (keyof TO)[]) {
		const factory = unified[key];
		if (factory) {
			instantiated.push(factory(key));
		}
	}
	for (const key of Object.getOwnPropertySymbols(definition) as (keyof TO)[]) {
		const factory = unified[key];
		if (factory) {
			instantiated.push(factory(key));
		}
	}
	return instantiated;
}

export function objectHasDefinition<FROM extends object, TO extends FROM>(
	definition: PropertyGuards<FROM, TO>,
): ReasonGuard<FROM, TO> {
	const instantiated = instantiatePropertyGuards(definition);
	// typescript won't allow us to inline this below
	const typed = checkDefinition<FROM, TO>;
	return typed.bind(undefined, instantiated) as ReasonGuard<FROM, TO>;
}

export const isObjectWithDefinition = <TO extends object>(definition: PropertyGuards<object, TO>) =>
	thenGuard<unknown, object, TO>(isObject, objectHasDefinition(definition));
