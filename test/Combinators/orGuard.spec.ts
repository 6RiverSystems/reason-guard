import { testTwoArgCombinator } from './testCombinator';
import { orGuard } from '../../src';

describe('or', function() {
	testTwoArgCombinator('|', [false, true, true, true], orGuard);
});
