/* global naturalCompare */
import assert from 'assert';
import { naturalCompare, naturalAnalyticalCompare } from '../natural-compare.esm.js';

describe('natural-compare.esm.js', () => {
    it('naturalCompare', () => {
        const actual = naturalCompare(5, '123');

        assert.strictEqual(actual, -1);
    });

    it('naturalAnalyticalCompare', () => {
        const actual = naturalAnalyticalCompare(5, '123');

        assert.strictEqual(actual, 1);
    });
});
