import {DemoAssistant} from './util';
import {isNumber, isString, isUndefined, isBoolean, isFunction} from '../src';

const demoAssistant = new DemoAssistant();
const mysteryBox = <any>demoAssistant.generateSomething();
// I want a function that will take in some input and tell me if its a string or a number
// or something else
function whatsInTheBox(input: number | string) {
	const e: Error[] = [];
	const confirmations: string[] = [];

	isString(input, e, confirmations);
	isNumber(input, e, confirmations);
	isUndefined(input, e, confirmations);
	isBoolean(input, e, confirmations);
	isFunction(input, e, confirmations);
	return {e, confirmations};
}
const {e, confirmations} = whatsInTheBox(mysteryBox);
console.log(e);
console.log(confirmations);
