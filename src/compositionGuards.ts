import {isString} from './primitiveGuards';
import {isDate} from './instanceGuards';
import {isDateString} from './parseGuards';
import {thenGuard, orGuard} from './Combinators';

export const isDateOrStringDate = orGuard(
	thenGuard(
		isString,
		isDateString
	),
	isDate
);
