import {testCombinator2} from './testCombinator';
import {orGuard} from '../../src';

describe('or', function() {
	testCombinator2('|', [false, true, true, true], orGuard);
});
