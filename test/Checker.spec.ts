import {assert} from 'chai';

import {checkerToGuard} from '../src';

describe('checkerToGuard', function() {
	const trueChecker = () => 'true';
	const falseChecker = () => {
		throw new Error('false');
	};

	it('should fill a default for the errors list', function() {
		// mostly asserting this does not throw
		assert.isTrue(checkerToGuard(trueChecker)({}, undefined, []));
	});
	it('should fill a default for the confirmations list', function() {
		// mostly asserting this does not throw
		assert.isFalse(checkerToGuard(falseChecker)({}, [], undefined));
	});
});
