/* global naturalCompare */
const assert = require('assert');
const fs = require('fs');

it('natural-compare.js', () => {
    eval(fs.readFileSync('dist/natural-compare.js', 'utf8'));
    const actual = naturalCompare(5, '123');

    assert.strictEqual(actual, -1);
});
