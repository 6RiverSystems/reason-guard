import {ReasonGuard} from './ReasonGuard';

const trueGuard: ReasonGuard<unknown, unknown> = (input, _errs, confs = []): input is unknown => {
	confs.push('true');
	return true;
};
const falseGuard: ReasonGuard<unknown, never> = (input, errs = []): input is never => {
	try {
		throw new Error('false');
	} catch (err) {
		errs.push(err);
		return false;
	}
};

export const constantGuards: (result: boolean) => ReasonGuard<unknown, unknown> =
	(result: boolean) => result ? trueGuard : falseGuard;
