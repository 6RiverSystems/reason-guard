import {testTwoArgCombinator} from './testCombinator';
import {thenGuard, ReasonGuard} from '../../src';

describe('then/and', function() {
	testTwoArgCombinator(',', [false, false, false, true], thenGuard);
});

const x: ReasonGuard<unknown, unknown> = undefined as any;
const y = thenGuard(x, x);
