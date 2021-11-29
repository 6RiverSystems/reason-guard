import { checkerToGuard } from './Checker';
import { errorLike } from './ReasonGuard';

/**
 * Would Number.parseFloat parse this input?
 */
export const isNumberString = checkerToGuard<string, string>((input) => {
	if (!isNaN(Number.parseFloat(input))) {
		return 'is Number-string';
	} else {
		return errorLike('is not Number-string');
	}
});

/**
 * Would Date.parse parse this input?
 */
export const isDateString = checkerToGuard<string, string>((input) => {
	if (!isNaN(Date.parse(input))) {
		return 'is Date-string';
	} else {
		return errorLike('is not Date-string');
	}
});

/**
 * Would BigInt parse this input?
 */
export const isBigIntString = checkerToGuard<string, string>((input) => {
	try {
		// eslint-disable-next-line 6river/new-cap
		BigInt(input);
		return 'is BigInt-string';
	} catch (err) {
		return errorLike('is not BigInt-string');
	}
});
