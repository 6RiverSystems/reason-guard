import { assert } from 'chai';

import { ReasonGuard } from '../src';

const MinIterations = 10_000;
const MaxIterations = 100_000_000;
const MinDurationMs = 75;
const TargetDurationMs = 100;

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
	ctx: Mocha.Context,
	guard: ReasonGuard<FROM, TO>,
	goodValueGenerator: () => TO,
	badValueGenerator: () => FROM,
) {
	if (process.env.SKIP_SLOW) {
		// don't run these slow tests during git commit validation or the like
		ctx.skip();
	}
	const positiveResults = benchGuard(guard, () => Array.from({ length: 100 }, goodValueGenerator));
	// eslint-disable-next-line no-console
	console.log(positiveResults, 'positive results');
	const negativeResults = benchGuard(guard, () => Array.from({ length: 100 }, badValueGenerator));
	// eslint-disable-next-line no-console
	console.log(negativeResults, 'negative results');

	for (const mode of Object.keys(negativeResults) as (keyof GuardBenchResults)[]) {
		assert.isAtMost(
			negativeResults[mode].nsPerCall,
			// negative results should be no more than 50ns+50% slower than positives
			positiveResults[mode].nsPerCall * 1.5 + 50,
			`negative result for ${mode} should be within 50%+50ns of positive result ${negativeResults[mode].nsPerCall}`,
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
			let nextIterations = Math.ceil((TargetDurationMs * iterations) / duration);
			if (nextIterations > iterations * 10) {
				// don't let it grow too fast, we may have a low-accuracy measurement
				nextIterations = iterations * 10;
			} else if (nextIterations > MaxIterations) {
				nextIterations = MaxIterations;
			}
			iterations = nextIterations;
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
		if (duration <= 0) {
			duration = 1;
		}
	} while (duration < MinDurationMs && iterations < MaxIterations);
	return {
		nsPerCall: Math.round((duration * 1_000_000) / iterations),
		iterations,
		duration,
	};
}
