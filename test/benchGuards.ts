import { assert } from 'chai';

import { ErrorLike, ReasonGuard } from '../src';

const MinIterations = 100_000;
const MaxIterations = 100_000_000;
const MinDurationMs = 75;
const TargetDurationMs = 100;

export class GuardSingleGenerator<T> {
	readonly values: T[] = [];
	constructor(readonly generator: () => T) {}
	ensure(len: number): T[] {
		while (this.values.length < len) {
			this.values.push(this.generator());
		}
		if (this.values.length === len) {
			return this.values;
		}
		return this.values.slice(0, len);
	}
}

export interface GuardInput<T> {
	ensure(len: number): T[];
}

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
	values: GuardInput<FROM>,
): GuardBenchResults {
	values.ensure(MinIterations);
	return {
		baseline: benchOnce(guard, values, false, false),
		withErrors: benchOnce(guard, values, true, false),
		withConfirmations: benchOnce(guard, values, false, true),
		withAll: benchOnce(guard, values, true, true),
	};
}

export function assertBenchGuard<FROM, TO extends FROM>(
	ctx: Mocha.Context,
	guard: ReasonGuard<FROM, TO>,
	good: GuardInput<TO>,
	bad: GuardInput<FROM>,
) {
	if (process.env.SKIP_SLOW) {
		// don't run these slow tests during git commit validation or the like
		ctx.skip();
	}
	const positiveResults = benchGuard(guard, good);
	// eslint-disable-next-line no-console
	console.log(positiveResults, 'positive results');
	const negativeResults = benchGuard(guard, bad);
	// eslint-disable-next-line no-console
	console.log(negativeResults, 'negative results');

	// positive and negative results don't compare exactly. particularly,
	// withErrors / withConfirmations are complementary.
	type resultType = keyof GuardBenchResults;
	const modePair: Record<resultType, resultType> = {
		baseline: 'baseline',
		withErrors: 'withConfirmations',
		withConfirmations: 'withErrors',
		withAll: 'withAll',
	};

	for (const mode of Object.keys(negativeResults) as (keyof GuardBenchResults)[]) {
		const pair = modePair[mode];
		assert.isAtMost(
			negativeResults[mode].nsPerCall,
			// negative results should be no more than 50ns+50% slower than positives
			positiveResults[pair].nsPerCall * 1.5 + 50,
			`negative result for ${mode} should be within 50%+50ns of ` +
				`positive ${pair} result ${positiveResults[pair].nsPerCall}`,
		);
	}
}

export function benchOnce<FROM, TO extends FROM>(
	guard: ReasonGuard<FROM, TO>,
	values: GuardInput<FROM>,
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
			if (nextIterations > MaxIterations) {
				nextIterations = MaxIterations;
			}
			iterations = nextIterations;
		}
		values.ensure(iterations);
		duration = timeOnce(guard, values.ensure(iterations), errors, confirmations);
	} while (duration < MinDurationMs && iterations < MaxIterations);
	// take the best of three, we already have one
	for (let i = 0; i < 2; ++i) {
		const rerunDuration = timeOnce(guard, values.ensure(iterations), errors, confirmations);
		if (rerunDuration < duration) {
			duration = rerunDuration;
		}
	}
	return {
		nsPerCall: Math.round((duration * 1_000_000) / iterations),
		iterations,
		duration,
	};
}
export function timeOnce<FROM, TO extends FROM>(
	guard: ReasonGuard<FROM, TO>,
	values: FROM[],
	errors?: ErrorLike[],
	confirmations?: string[],
) {
	// measure cpu time, not clock time
	const start2 = process.cpuUsage();
	for (let i = 0; i < values.length; ++i) {
		// reduce GC overhead by truncating these arrays instead of making new ones.
		// clearing these still ends up consuming _most_ of the time in the test!
		if (errors?.length) {
			errors.length = 0;
		}
		if (confirmations?.length) {
			confirmations.length = 0;
		}
		guard(values[i], errors, confirmations);
	}
	const delta = process.cpuUsage(start2);
	return (delta.user + delta.system) / 1000;
}
