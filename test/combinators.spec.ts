import {assertGuardConfirmed, assertGuardFailed, falseGuard, trueGuard} from './util';
import {orGuard, notGuard, andGuard, thenGuard} from '../src/combinators';

describe('combinators', function() {
	context('or', function() {
		it('F|F=F', function() {
			assertGuardFailed(orGuard(falseGuard, falseGuard), undefined);
		})
		it('F|T=T', function() {
			assertGuardConfirmed(orGuard(falseGuard, trueGuard), undefined);
		});
		it('T|F=T', function() {
			assertGuardConfirmed(orGuard(trueGuard, falseGuard), undefined);
		});
		it('T|T=T', function() {
			assertGuardConfirmed(orGuard(trueGuard, trueGuard), undefined);
		});
	});
	context('and', function() {
		it('F&F=F', function() {
			assertGuardFailed(andGuard(falseGuard, falseGuard), undefined);
		})
		it('F&T=F', function() {
			assertGuardFailed(andGuard(falseGuard, trueGuard), undefined);
		});
		it('T&F=F', function() {
			assertGuardFailed(andGuard(trueGuard, falseGuard), undefined);
		});
		it('T&T=T', function() {
			assertGuardConfirmed(andGuard(trueGuard, trueGuard), undefined);
		});
	});
	context('not', function() {
		it('!F=T', function() {
			assertGuardConfirmed(notGuard(falseGuard), undefined);
		});
		it('!T=F', function() {
			assertGuardFailed(notGuard(trueGuard), undefined);
		})
	});
	context('then', function() {
		it('F,F=F', function() {
			assertGuardFailed(thenGuard(falseGuard, falseGuard), undefined);
		})
		it('F,T=F', function() {
			assertGuardFailed(thenGuard(falseGuard, trueGuard), undefined);
		});
		it('T,F=F', function() {
			assertGuardFailed(thenGuard(trueGuard, falseGuard), undefined);
		});
		it('T,T=T', function() {
			assertGuardConfirmed(thenGuard(trueGuard, trueGuard), undefined);
		});
	})
});
