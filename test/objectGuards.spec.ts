import { PropertyGuards, objectHasDefinition } from '../src/objectGuards';
import { isBoolean } from '../src/primitiveGuards';

type _From = {
	a: string;
	b: number;
};

type _To = {
	a: string;
	b: number;
	c: boolean;
};

type _GT = PropertyGuards<_From, _To>;

// TODO: why does this give an error if you explicitly type it as PropertyGuards<_From, _To>?
// it works in typescript 3.3.4000
// it fails in 3.4.1 (next release)
// I think the
const _G: _GT = {
	c: isBoolean,
};

const _g = objectHasDefinition(_G);
