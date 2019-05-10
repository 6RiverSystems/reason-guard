import { PropertyGuards, objectHasDefinition } from '../src/objectGuards';
import { isBoolean, isString } from '../src/primitiveGuards';
import { hasBooleanProperty, ReasonGuard } from '../src';

type _From = {
	a: string;
	b: number;
};

type _To = {
	a: string;
	b: number;
	c: boolean;
};

// TODO: why does this give an error if you explicitly type it as PropertyGuards<_From, _To>?
// it works in typescript 3.3.4000
// it fails in 3.4.1 (next release)
// I think the
const _G: PropertyGuards<_From, _To> = {
	c: isBoolean,
};

const _g = objectHasDefinition(_G);

type _FromComplex = {
	a: string;
	b: {
		c: number;
	};
};
type _ToComplex = {
	a: string;
	b: {
		c: number;
		d: boolean;
	};
	e: string;
};
const _GC: PropertyGuards<_FromComplex, _ToComplex> = {
	// TODO: without the cast this doesn't work, it's not smart enough to infer the from[b] instead of unknown
	// TODO: even with the cast, typescript >= 3.4.1 fails to recognize that 'b' is in the list of different properties
	b: hasBooleanProperty('d') as ReasonGuard<_FromComplex['b'], _ToComplex['b']>,
	e: isString,
}

const _gc = objectHasDefinition(_GC);
