import {testCombinator2} from './testCombinator';
import {thenGuard} from '../../src';

describe('then/and', function() {
	testCombinator2(',', [false, false, false, true], thenGuard);
});
