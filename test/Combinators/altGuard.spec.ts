import { altGuard, notGuard } from '../../src';
import { testOneArgCombinator } from './testCombinator';

describe('alt', function () {
	testOneArgCombinator('~', [false, true, false, true], altGuard);
	testOneArgCombinator('!~', [true, false, false, true], (g) => notGuard(altGuard(g)));
});
