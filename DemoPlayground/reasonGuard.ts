import * as guards from '../src/index';

const e: Error[] = [];
const confirmations: string[] = [];
guards.isUUID('123', e, confirmations);

console.log(e);
console.log(confirmations);
