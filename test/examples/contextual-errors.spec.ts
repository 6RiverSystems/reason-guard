import { assert } from 'chai';

import { assertGuards } from '../assertGuards';
import {
	requiredProperty,
	isString,
	isNumber,
	hasArrayProperty,
	isObjectWithDefinition,
	isLiteral,
} from '../../src';
import { ContextError } from '../../src/ContextError';

type Bounds = { x1: number; y1: number; x2: number; y2: number };
type Feature = { name: string; type: 'aisle' | 'workflowPoint' | 'area'; bounds: Bounds };
type Map = { version: string; name: string; bounds: Bounds; aisles: Feature[] };

const isBounds = isObjectWithDefinition<Bounds>({
	x1: requiredProperty(isNumber),
	x2: requiredProperty(isNumber),
	y1: requiredProperty(isNumber),
	y2: requiredProperty(isNumber),
});

const isFeature = isObjectWithDefinition<Feature>({
	name: requiredProperty(isString),
	type: requiredProperty(isLiteral(['aisle', 'workflowPoint', 'area'])),
	bounds: requiredProperty(isBounds),
});

const mapGuard = isObjectWithDefinition<Map>({
	version: requiredProperty(isString),
	name: requiredProperty(isString),
	bounds: requiredProperty(isBounds),
	aisles: hasArrayProperty(isFeature),
});

describe('guard context', function() {
	const map: Map = {
		name: 'xyzzy',
		version: '2.0',
		bounds: { x1: 0, y1: 0, x2: 100, y2: 100 },
		aisles: [
			{
				name: 'S2-A1',
				type: 'aisle',
				bounds: { x1: 0, y1: 0, x2: 100, y2: 100 },
			},
		],
	};

	it('resolves path for errors', function() {
		const test = JSON.parse(JSON.stringify(map));
		(test.version as any) = 77;
		(test.bounds.x1 as any) = 'BAADF00D';
		(test.aisles[0].bounds.x1 as any) = 'BAADF00D';
		test.aisles[0].type = 'BAADF00D';
		delete test.aisles[0].name;
		assertGuards(false)(mapGuard, test);

		const errors: ContextError[] = [];
		assert.isFalse(mapGuard(test, errors));
		assert.lengthOf(errors, 5);
		assert.deepEqual(errors[0].context, ['version']);
		assert.deepEqual(errors[1].context, ['bounds', 'x1']);
		assert.deepEqual(errors[2].context, ['aisles', 0, 'name']);
		assert.deepEqual(errors[3].context, ['aisles', 0, 'type']);
		assert.deepEqual(errors[4].context, ['aisles', 0, 'bounds', 'x1']);
	});
});
