import { testOneArgCombinator } from './testCombinator';
import { altGuard, notGuard } from '../../src';

describe('alt', function() {
	testOneArgCombinator('~', [false, true, false, true], altGuard);
	testOneArgCombinator('!~', [true, false, false, true], g => notGuard(altGuard(g)));
});
