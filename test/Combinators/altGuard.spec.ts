import {testCombinator1} from './testCombinator';
import {altGuard, notGuard} from '../../src';

describe('alt', function() {
	testCombinator1('~', [false, true, false, true], altGuard);
	testCombinator1('!~', [true, false, false, true], (g) => notGuard(altGuard(g)));
});
