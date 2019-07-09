import {assert} from 'chai';

import {checkerToGuard, isUUID} from '../src';

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

	context('isUUID', function() {
		it('should guard for a valid UUID', function() {
			assert.isTrue(isUUID('0ca8f69c-1d07-4404-9b82-d1d0eb492313'));
		});

		it('should guard against a invalid UUID', function() {
			assert.isFalse(isUUID(3));
		});
	});
});
