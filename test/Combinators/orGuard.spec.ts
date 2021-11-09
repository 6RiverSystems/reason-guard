import { orGuard } from '../../src';
import { testTwoArgCombinator } from './testCombinator';

describe('or', function () {
	testTwoArgCombinator('|', [false, true, true, true], orGuard);
});
