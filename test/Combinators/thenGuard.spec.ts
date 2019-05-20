import {testTwoArgCombinator} from './testCombinator';
import {thenGuard} from '../../src';

describe('then/and', function() {
	testTwoArgCombinator(',', [false, false, false, true], thenGuard);
});
