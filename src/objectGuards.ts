import {ReasonGuard} from './ReasonGuard';
import {hasProperty, propertyHasType} from './propertyGuards';
import {thenGuard} from './combinators';

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
export type ChangedFields<FROM, TO extends FROM> = NarrowedFields<FROM, TO> | ExtendedFields<FROM, TO>;

export type PropertyGuards<FROM extends Object, TO extends FROM> = {
	[P in ChangedFields<FROM, TO>]: P extends keyof FROM ? ReasonGuard<FROM[P], TO[P]> : ReasonGuard<unknown, TO[P]>;
};

// this shouldn't be needed, but if the property voodoo goes wrong it might be
// needs to be a factory functionfor the generic parameterization to work?
// export function identityGuard<T>(): ReasonGuard<T, T> {
// 	return (_input, _output, confirmations): _input is T => {
// 		confirmations.push('true');
// 		return true;
// 	};
// }

// don't seem to need this
// type PropertyGuarded<G> = G extends PropertyGuards<infer FROM, infer TO> ? ReasonGuard<FROM, TO> : never;

function checkDefinition<FROM extends Object, TO extends FROM>(
	definition: PropertyGuards<FROM, TO>, input: FROM, output: Error[], confirmations: string[],
): input is TO {
	let anyPassed = false;
	let anyFailed = false;

	function checkProperty(k: ChangedFields<FROM, TO>) {
		if (thenGuard(
			hasProperty(k),
			// sadly this requires some `any`ing because the type system doesn't know which value `k` has
			propertyHasType<unknown, any>(definition[k] as any)(k)
		)(input, output, confirmations)) {
			anyPassed = true;
		} else {
			anyFailed = true;
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
	<(<FROM extends Object, TO extends FROM>(definition: PropertyGuards<FROM, TO>) => ReasonGuard<FROM, TO>)>(
		(definition) =>
			(input, output = [], confirmations = []) => checkDefinition(definition, input, output, confirmations)
	);
