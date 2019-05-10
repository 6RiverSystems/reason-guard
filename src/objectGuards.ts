import {ReasonGuard} from './ReasonGuard';
import {hasProperty} from './propertyGuards';
import {thenGuard} from './combinators';

type DifferentFields<FROM extends Object, TO extends FROM, K extends keyof TO = keyof TO> = {
	[P in K]: P extends keyof FROM ? (
		// this reverse extends check doesn't work if you just look at T[P],
		// only if you put it in an object
		{[PP in P]: FROM[PP]} extends {[PP in P]: TO[PP]} ? never : P
	) : P;
}[K]

export type PropertyGuards<FROM extends Object, TO extends FROM> = {
	[P in DifferentFields<FROM, TO>]: P extends keyof FROM ? ReasonGuard<FROM[P], TO[P]> : ReasonGuard<unknown, TO[P]>;
};

// TODO: there's got to be a better way to write this than as an iife
// thankfully it's not needed if the exclusion voodoo above works
// export const identityGuard = (<(<T>() => ReasonGuard<T, T>)>(
// 	() => (_input, _output, confirmations) => {
// 		confirmations.push('true');
// 		return true;
// 	}
// ))();

// don't seem to need this
// type PropertyGuarded<G> = G extends PropertyGuards<infer FROM, infer TO> ? ReasonGuard<FROM, TO> : never;

function checkDefinition<FROM extends Object, TO extends FROM>(
	definition: PropertyGuards<FROM, TO>, input: FROM, output: Error[], confirmations: string[],
): input is TO {
	let anyPassed = false;
	let anyFailed = false;

	function checkProperty(k: DifferentFields<FROM, TO>) {
		if (thenGuard(hasProperty(k), definition[k] as any)(input, output, confirmations)) {
			anyPassed = true;
		} else {
			anyFailed = false;
		}
	}

	// if k in keyof FROM, then hasProperty is redundant, but that's not something we can express here
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
		(definition) => (input, output, confirmations) => checkDefinition(definition, input, output, confirmations)
	);
