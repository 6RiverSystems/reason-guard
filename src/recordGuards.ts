import { pushContext } from './Checker';
import { thenGuard } from './Combinators';
import { ContextError } from './ContextError';
import { ErrorLike, ReasonGuard } from './ReasonGuard';
import { isObject } from './primitiveGuards';

// Record guards are designed for objects with free-form (e.g. indexer) keys
// with a common type, vs. object guards where there are specific keys
// (properties) with individual types

function checkRecord<K extends symbol | string, V>(
	keyChecker: ReasonGuard<symbol | string, K>,
	valueChecker: ReasonGuard<unknown, V>,
	input: object,
	output?: ErrorLike[],
	confirmations?: string[],
	context?: PropertyKey[],
): input is Record<K, V> {
	let anyFailed = false;
	function checkProperty(k: string | symbol) {
		const keyErrors: ErrorLike[] = [];
		const keyConfirmations: string[] = [];
		const innerContext = pushContext(String(k), context);
		if (!keyChecker(k, keyErrors, keyConfirmations, innerContext)) {
			anyFailed = true;
			output?.push(
				...keyErrors.map(
					(err) =>
						new ContextError(
							`key ${String(k)}: ${err.message}`,
							err instanceof ContextError ? err.context : innerContext,
						),
				),
			);
		} else {
			confirmations?.push(...keyConfirmations.map((c) => `key ${String(k)}: ${c}`));
		}
		const valueErrors: ErrorLike[] = [];
		const valueConfirmations: string[] = [];
		// have to cast to any here because we're using object as a placeholder for
		// what might more strictly be `Readonly<Record<string|symbol, unknown>>`,
		// esp. since we are still checking values even if the key checker failed
		if (!valueChecker((input as any)[k], valueErrors, valueConfirmations, innerContext)) {
			anyFailed = true;
			output?.push(
				...valueErrors.map(
					(err) =>
						new ContextError(
							`value ${String(k)}: ${err.message}`,
							err instanceof ContextError ? err.context : innerContext,
						),
				),
			);
		} else {
			confirmations?.push(...valueConfirmations.map((c) => `value ${String(k)}: ${c}`));
		}
	}
	// Object.entries would be nice here, but it doesn't give us symbols
	Object.getOwnPropertyNames(input).forEach(checkProperty);
	// repeat!
	Object.getOwnPropertySymbols(input).forEach(checkProperty);

	// unlike an object guard, we don't care if there are no properties, so we
	// don't track or check `anyPassed` here

	return !anyFailed;
}

export function objectIsRecord<K extends symbol | string, V>(
	keyChecker: ReasonGuard<symbol | string, K>,
	valueChecker: ReasonGuard<unknown, V>,
): ReasonGuard<object, Record<K, V>> {
	return (input, output, confirmations, context = []): input is Record<K, V> =>
		checkRecord(keyChecker, valueChecker, input, output, confirmations, context);
}

export function isRecord<K extends symbol | string, V>(
	keyChecker: ReasonGuard<symbol | string, K>,
	valueChecker: ReasonGuard<unknown, V>,
): ReasonGuard<unknown, Record<K, V>> {
	return thenGuard(isObject, objectIsRecord(keyChecker, valueChecker));
}
