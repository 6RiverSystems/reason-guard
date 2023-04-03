import { testTwoArgCombinator } from './testCombinator';
import { thenGuard } from '../../src';

describe('then', function () {
	it('behaves as && at runtime', function () {
		testTwoArgCombinator(',', [false, false, false, true], thenGuard);
	});
});
