const TYPE_EOF   = 0b0000;
const TYPE_WS    = 0b0001;
const TYPE_DELIM = 0b0010;
const TYPE_NUM   = 0b0100;
const TYPE_WORD  = 0b1000;
const TYPE_WS_OR_DELIM = TYPE_WS | TYPE_DELIM;
const TYPE_NUM_OR_WORD = TYPE_NUM | TYPE_WORD;
const DEBUG = false;
const DEBUG_TYPE_NAME = {
    [TYPE_EOF]: 'eof',
    [TYPE_WS]: 'ws',
    [TYPE_DELIM]: 'delim',
    [TYPE_NUM]: 'number',
    [TYPE_WORD]: 'word'
};

const isSortableValue = value => typeof value === 'number' || typeof value === 'string';
const safeCharCodeAt = (source, offset) => offset < source.length ? source.charCodeAt(offset) : 0;
const isSign = (code) => code === 0x002B || code === 0x002D; // + or -
const isDigit = (code) => code >= 0x0030 && code <= 0x0039;
const isWS = (code) => (
    code === 0x0009 ||  // \t
    code === 0x000A ||  // \n
    code === 0x000C ||  // \f
    code === 0x000D ||  // \r
    code === 0x0020     // whitespace
);
const isDelim = (code) => (
    (code > 0x0020 && code < 0x0100) &&  // ascii char
    (code < 0x0041 || code > 0x005A) &&  // not A..Z
    (code < 0x0061 || code > 0x007A) &&  // not a..z
    !isDigit(code) &&                    // not 0..9
    !isSign(code)                        // not + or -
) || code === 0x2116;  /* № */
const isWord = (code) => (
    code &&
    !isWS(code) &&
    !isDelim(code) &&
    !isDigit(code)
);

//  Check if three code points would start a number
const isNumberStart = (first, second, third) => {
    // Look at the first code point:

    // U+002B PLUS SIGN (+)
    // U+002D HYPHEN-MINUS (-)
    if (isSign(first)) {
        // If the second code point is a digit, return true.
        if (isDigit(second)) {
            return 2;
        }

        // Otherwise, if the second code point is a U+002E FULL STOP (.)
        // and the third code point is a digit, return true.
        // Otherwise, return false.
        return second === 0x002E && isDigit(third) ? 3 : 0;
    }

    // U+002E FULL STOP (.)
    // if (first === 0x002E) {
    //     // If the second code point is a digit, return true. Otherwise, return false.
    //     return isDigit(second) ? 2 : 0;
    // }

    // digit
    if (isDigit(first)) {
        // Return true.
        return 1;
    }

    // anything else
    // Return false.
    return 0;
};

const findEndOfType = (source, offset, isType) => {
    while (isType(safeCharCodeAt(source, ++offset))) {
        // do nothing
    }

    return offset;
};

const consumeNumber = (source, offset, preventFloat) => {
    let code = safeCharCodeAt(source, offset);

    // If the next input code point is U+002B PLUS SIGN (+) or U+002D HYPHEN-MINUS (-),
    // consume it and append it to repr.
    if (isSign(code)) {
        code = safeCharCodeAt(source, offset += 1);
    }

    // While the next input code point is a digit, consume it and append it to repr.
    if (isDigit(code)) {
        offset = findEndOfType(source, offset, isDigit);
        code = safeCharCodeAt(source, offset);
    }

    // If the next 2 input code points are U+002E FULL STOP (.) followed by a digit, then:
    if (code === 0x002E && isDigit(safeCharCodeAt(source, offset + 1))) {
        if (preventFloat) {
            return offset;
        }

        // Consume them
        // While the next input code point is a digit, consume it and append it to repr.
        const expectedEnd = findEndOfType(source, offset + 1, isDigit);
        code = safeCharCodeAt(source, expectedEnd);

        // If next char is U+002E FULL STOP (.), then don't consume
        if (code === 0x002E) {
            return offset;
        }

        offset = expectedEnd;
    }

    // If the next 2 or 3 input code points are U+0045 LATIN CAPITAL LETTER E (E)
    // or U+0065 LATIN SMALL LETTER E (e), ... , followed by a digit, then:
    if (code === 0x0045 /* e */ || code === 0x0065 /* E */) {
        let sign = 1;
        code = safeCharCodeAt(source, offset + 1);

        // ... optionally followed by U+002D HYPHEN-MINUS (-) or U+002B PLUS SIGN (+) ...
        if (isSign(code)) {
            sign = 2;
            code = safeCharCodeAt(source, offset + 2);
        }

        // ... followed by a digit
        if (isDigit(code)) {
            // While the next input code point is a digit, consume it and append it to repr.
            offset = findEndOfType(source, offset + sign, isDigit);
        }
    }

    return offset;
};

const getToken = (source, offset, preventFloat, preventSign) => {
    if (offset >= source.length) {
        return TYPE_EOF;
    }

    const code = safeCharCodeAt(source, offset);

    // Whitespace
    if (isWS(code)) {
        return TYPE_WS | (findEndOfType(source, offset, isWS) - offset << 4);
    }

    // Delim sequence
    // console.log(source[offset], isDelim(a), a.toString(16), preventSign)
    if (isDelim(code) || (preventSign && isSign(code))) {
        return TYPE_DELIM | (findEndOfType(source, offset, isDelim) - offset << 4);
    }

    // Number
    if (isNumberStart(code, safeCharCodeAt(source, offset + 1), safeCharCodeAt(source, offset + 2))) {
        return TYPE_NUM | (consumeNumber(source, offset, preventFloat) - offset << 4);
    }

    // Word
    return TYPE_WORD | (findEndOfType(source, offset, isWord) - offset << 4);
};

const compare = (a, b, analytical) => {
    let offsetA = 0;
    let offsetB = 0;
    let preventFloat = false;
    let preventSign = false;
    let postCmpResult = 0;
    let postCmpResultType = 0;
    let firstPart = true;

    while (true) {
        const partA = getToken(a, offsetA, preventFloat, preventSign);
        const partB = getToken(b, offsetB, preventFloat, preventSign);
        const typeA = partA & 15;
        const lenA = partA >> 4;
        const typeB = partB & 15;
        const lenB = partB >> 4;

        /* c8 ignore next 6 */
        if (DEBUG) {
            console.log({
                typeA: DEBUG_TYPE_NAME[typeA], lenA, substrA: a.substr(offsetA, lenA),
                typeB: DEBUG_TYPE_NAME[typeB], lenB, substrB: b.substr(offsetB, lenB)
            });
        }

        if (typeA !== typeB) {
            if (firstPart && (typeA & TYPE_WS_OR_DELIM) && (typeB & TYPE_NUM_OR_WORD)) {
                postCmpResult = 1;
                postCmpResultType = typeA;
                offsetA += lenA;
                continue;
            }

            if (firstPart && (typeB & TYPE_WS_OR_DELIM) && (typeA & TYPE_NUM_OR_WORD)) {
                postCmpResult = -1;
                postCmpResultType = typeB;
                offsetB += lenB;
                continue;
            }

            return typeA - typeB;
        }

        // both parts are the same type, no matter which type to test
        if (typeA === TYPE_EOF) {
            return postCmpResult;
        }

        // reset flags
        firstPart = false;
        preventFloat = false;
        preventSign = false;

        // find difference in substr
        const minLength = lenA < lenB ? lenA : lenB;
        let substrDiff = lenA - lenB;
        let cA = '';
        let cB = '';
        for (let i = 0; i < minLength; i++) {
            cA = a[offsetA + i];
            cB = b[offsetB + i];

            if (cA !== cB) {
                substrDiff = cA < cB ? -1 : 1;
                break;
            }
        }

        // both parts are the same type, no matter which type to test
        if (typeA & TYPE_WS_OR_DELIM) {
            preventFloat = a[offsetA + lenA - 1] === '.';

            if (substrDiff !== 0) {
                if (typeA > postCmpResultType) {
                    postCmpResultType = typeA;
                    postCmpResult = substrDiff;
                }
            }
        } else if (typeA & TYPE_NUM) {
            preventSign = true;

            if (substrDiff !== 0) {
                const numDiff = a.substr(offsetA, lenA) - b.substr(offsetB, lenB);

                if (numDiff !== 0) {
                    return analytical ? -numDiff : numDiff;
                }

                if (typeA > postCmpResultType) {
                    const afc = safeCharCodeAt(a, offsetA);
                    const bfc = safeCharCodeAt(b, offsetB);
                    const order = afc === 0x002D ? -1 : 1;

                    // a/b  -  o  +
                    //   -  0 -1 -1
                    //   o  1  0 -1
                    //   +  1  1  0

                    postCmpResultType = typeA;
                    postCmpResult = afc !== bfc && (afc === 0x002D /* - */ || bfc === 0x002B /* + */)
                        ? -1
                        : afc !== bfc && (afc === 0x002B /* + */ || bfc === 0x002D /* - */)
                            ? 1
                            : (lenA - lenB || substrDiff) < 0 // lenA !== lenB ? lenA < lenB : substrDiff < 0
                                ? -order
                                : order;

                    if (analytical) {
                        postCmpResult = -postCmpResult;
                    }
                }
            }
        } else { // typeA === TYPE_WORD
            if (substrDiff !== 0) {
                if (cA !== cB) {
                    // case insensitive checking
                    const sA = a.substr(offsetA, lenA);
                    const sB = b.substr(offsetB, lenB);
                    const siA = sA.toLowerCase();
                    const siB = sB.toLowerCase();

                    if (siA !== siB) {
                        return siA < siB ? -1 : 1;
                    }

                    return sA < sB ? -1 : 1;
                }

                return substrDiff;
            }
        }

        offsetA += lenA;
        offsetB += lenB;
    }
};

const createCompareFn = analytical => (a, b) => {
    /* c8 ignore next */
    DEBUG && console.log('Compare', a, b);

    if (isSortableValue(a) && isSortableValue(b)) {
        const ret = Math.sign(compare(String(a), String(b), analytical));

        /* c8 ignore next */
        DEBUG && console.log('Result:', ret);

        return ret;
    }

    /* c8 ignore next */
    DEBUG && console.log('Result: (non-comparable)');

    return 0;
};

export const naturalCompare = createCompareFn(false);
export const naturalAnalyticalCompare = createCompareFn(true);
