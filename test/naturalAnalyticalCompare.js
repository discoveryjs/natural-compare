import assert from 'assert';
import { naturalAnalyticalCompare } from '@discoveryjs/natural-compare';

function naturalSorting(array) {
    return array.slice().sort(naturalAnalyticalCompare);
}

describe('naturalAnalyticalCompare', () => {
    it('basic', () => {
        const input = [
            '1',
            'a',
            '2',
            5,
            '0',
            '-1',
            'str2',
            '0004',
            '003',
            '+0',
            '-0',
            -10,
            '-12',
            'str12',
            'z',
            '10',
            '+11',
            'str1',
            'str9',
            'str+11',
            'str0004',
            'str003',
            '-5',
            'bbb',
            '12',
            '9',
            'b123'
        ];

        assert.deepEqual(naturalSorting(input), [
            '12',
            '+11',
            '10',
            '9',
            5,
            '0004',
            '003',
            '2',
            '1',
            '+0',
            '0',
            '-0',
            '-1',
            '-5',
            -10,
            '-12',
            'a',
            'b123',
            'bbb',
            'str12',
            'str9',
            'str0004',
            'str003',
            'str2',
            'str1',
            'str+11',
            'z'
        ]);
    });
});
