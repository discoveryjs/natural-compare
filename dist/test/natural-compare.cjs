/* global naturalCompare */
const assert = require('assert');
const fs = require('fs');

describe('natural-compare.js', () => {
    eval(fs.readFileSync('dist/natural-compare.js', 'utf8'));

    it('naturalCompare', () => {
        const actual = naturalCompare(5, '123');

        assert.strictEqual(actual, -1);
    });

    it('naturalAnalyticalCompare', () => {
        const actual = naturalAnalyticalCompare(5, '123');

        assert.strictEqual(actual, 1);
    });
});
