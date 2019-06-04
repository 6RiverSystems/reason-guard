import {checkerToGuard} from '../Checker';

/**
 * Would Number.parseFloat parse this input?
 */
export const isNumberString = checkerToGuard<string, string>((input) => {
	if (!isNaN(Number.parseFloat(input))) {
		return 'is Number-string';
	} else {
		throw new Error('is not Number-string');
	}
});

/**
 * Would Date.parse parse this input?
 */
export const isDateString = checkerToGuard<string, string>((input) => {
	if (!isNaN(Date.parse(input))) {
		return 'is Date-string';
	} else {
		throw new Error('is not Date-string');
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
		throw new Error('is not BigInt-string');
	}
});
