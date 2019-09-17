import {DemoAssistant} from './util';

const demoAssistant = new DemoAssistant();
const mysteryBox = <any>demoAssistant.generateSomething();

// I want a function that will take in some input and tell me if its a string or a number
// or something else
function whatsInTheBox(input: any) {
	if (typeof input === 'string') {
		console.log('It\'s a string');
	} else if (typeof input === 'number') {
		console.log('It\'s a number');
	} else {
		console.log('It\'s something else');
	}
}

whatsInTheBox(mysteryBox);
