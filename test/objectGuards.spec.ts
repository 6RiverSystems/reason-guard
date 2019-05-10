import {objectHasDefinition} from '../src/objectGuards';
import {isBoolean, isString} from '../src/primitiveGuards';

type _From = {
	a: string;
	b: number;
};

type _To = {
	a: string;
	b: number;
	c: boolean;
};

const _g = objectHasDefinition<_From, _To>({
	c: isBoolean,
});

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

const _gc = objectHasDefinition<_FromComplex, _ToComplex>({
	b: objectHasDefinition({
		d: isBoolean,
	}),
	e: isString,
});
