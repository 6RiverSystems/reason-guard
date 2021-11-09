import { thenGuard } from '../../src';
import { testTwoArgCombinator } from './testCombinator';

describe('then', function () {
	it('behaves as && at runtime', function () {
		testTwoArgCombinator(',', [false, false, false, true], thenGuard);
	});
});
