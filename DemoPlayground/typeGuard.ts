
export function formatMoney(amount: string | number): string {
	let value = amount; // value type is number or string
	if (typeof amount === 'string') {
		 value = parseInt(amount, 10); // amount type is string
	}
	if (typeof value === 'number') {
		value = value.toFixed(2);
	}
	return '$' + value; // value type is number
}

console.log(formatMoney('8'));
console.log(formatMoney(10));
console.log(formatMoney(1.155798));

