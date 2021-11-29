import { assert } from 'chai';

import { ReasonGuard } from '../src';

const MinIterations = 100_000;
const MinDurationMs = 750;
const TargetDurationMs = 1_000;

interface GuardBenchResult {
	nsPerCall: number;
	iterations: number;
	duration: number;
}
/**
 * Reports ns per call for each mode
 */
export interface GuardBenchResults {
	baseline: GuardBenchResult;
	withConfirmations: GuardBenchResult;
	withErrors: GuardBenchResult;
	withAll: GuardBenchResult;
}

export function benchGuard<FROM, TO extends FROM>(
	guard: ReasonGuard<FROM, TO>,
	valueGenerator: () => FROM[],
): GuardBenchResults {
	// cache generated values to reduce GC overhead
	const values: FROM[] = [];
	while (values.length < MinIterations) {
		values.push(...valueGenerator());
	}
	return {
		baseline: benchOnce(guard, values, valueGenerator, false, false),
		withErrors: benchOnce(guard, values, valueGenerator, true, false),
		withConfirmations: benchOnce(guard, values, valueGenerator, false, true),
		withAll: benchOnce(guard, values, valueGenerator, true, true),
	};
}

export function assertBenchGuard<FROM, TO extends FROM>(
	guard: ReasonGuard<FROM, TO>,
	goodValueGenerator: () => TO,
	badValueGenerator: () => FROM,
) {
	const positiveResults = benchGuard(guard, () => Array.from({ length: 100 }, goodValueGenerator));
	// eslint-disable-next-line no-console
	console.log(positiveResults, 'positive results');
	const negativeResults = benchGuard(guard, () => Array.from({ length: 100 }, badValueGenerator));
	// eslint-disable-next-line no-console
	console.log(negativeResults, 'negative results');

	for (const mode of Object.keys(negativeResults) as (keyof GuardBenchResults)[]) {
		assert.isAtMost(
			negativeResults[mode].nsPerCall,
			// negative results should be no more than 50% slower than positives
			positiveResults[mode].nsPerCall * 1.5,
			`negative result for ${mode} should be within 50% of positive result`,
		);
	}
}

function benchOnce<FROM, TO extends FROM>(
	guard: ReasonGuard<FROM, TO>,
	values: FROM[],
	valueGenerator: () => FROM[],
	withErrors: boolean,
	withConfirmations: boolean,
): GuardBenchResult {
	const errors = withErrors ? [] : undefined;
	const confirmations = withConfirmations ? [] : undefined;
	let iterations = MinIterations;
	let duration = 0;
	do {
		if (duration) {
			iterations = Math.ceil(Math.max(iterations, (TargetDurationMs * iterations) / duration));
			// console.log(`after ${duration}, next ${iterations}`);
		}
		while (values.length < iterations) {
			values.push(...valueGenerator());
		}
		// TODO: use high res timer for this
		const start = Date.now();
		for (let i = 0; i < values.length && i < iterations; ++i) {
			// try to reduce GC overhead by truncating these arrays instead of making
			// new ones
			errors?.splice(0);
			confirmations?.splice(0);
			guard(values[i], errors, confirmations);
		}
		duration = Date.now() - start;
	} while (duration < MinDurationMs);
	return {
		nsPerCall: Math.round((duration * 1_000_000) / iterations),
		iterations,
		duration,
	};
}
