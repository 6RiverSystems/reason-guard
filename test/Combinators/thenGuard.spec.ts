import {testTwoArgCombinator, Tautology} from './testCombinator';
import {thenGuard} from '../../src';

describe('then/and', function() {
	const tuautologicalThen: (left: Tautology, right: Tautology) => Tautology =
		(left, right) => thenGuard<unknown, unknown, unknown>(left, right);
	testTwoArgCombinator(',', [false, false, false, true], tuautologicalThen);
});
