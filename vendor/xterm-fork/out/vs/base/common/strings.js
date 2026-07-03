"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.noBreakWhitespace = exports.CodePointIterator = void 0;
exports.isFalsyOrWhitespace = isFalsyOrWhitespace;
exports.format = format;
exports.format2 = format2;
exports.htmlAttributeEncodeValue = htmlAttributeEncodeValue;
exports.escape = escape;
exports.escapeRegExpCharacters = escapeRegExpCharacters;
exports.count = count;
exports.truncate = truncate;
exports.truncateMiddle = truncateMiddle;
exports.trim = trim;
exports.ltrim = ltrim;
exports.rtrim = rtrim;
exports.convertSimple2RegExpPattern = convertSimple2RegExpPattern;
exports.stripWildcards = stripWildcards;
exports.createRegExp = createRegExp;
exports.regExpLeadsToEndlessLoop = regExpLeadsToEndlessLoop;
exports.splitLines = splitLines;
exports.splitLinesIncludeSeparators = splitLinesIncludeSeparators;
exports.firstNonWhitespaceIndex = firstNonWhitespaceIndex;
exports.getLeadingWhitespace = getLeadingWhitespace;
exports.lastNonWhitespaceIndex = lastNonWhitespaceIndex;
exports.replaceAsync = replaceAsync;
exports.compare = compare;
exports.compareSubstring = compareSubstring;
exports.compareIgnoreCase = compareIgnoreCase;
exports.compareSubstringIgnoreCase = compareSubstringIgnoreCase;
exports.isAsciiDigit = isAsciiDigit;
exports.isLowerAsciiLetter = isLowerAsciiLetter;
exports.isUpperAsciiLetter = isUpperAsciiLetter;
exports.equalsIgnoreCase = equalsIgnoreCase;
exports.startsWithIgnoreCase = startsWithIgnoreCase;
exports.commonPrefixLength = commonPrefixLength;
exports.commonSuffixLength = commonSuffixLength;
exports.isHighSurrogate = isHighSurrogate;
exports.isLowSurrogate = isLowSurrogate;
exports.computeCodePoint = computeCodePoint;
exports.getNextCodePoint = getNextCodePoint;
const charCode_1 = require("vs/base/common/charCode");
const uint_1 = require("vs/base/common/uint");
function isFalsyOrWhitespace(str) {
    if (!str || typeof str !== 'string') {
        return true;
    }
    return str.trim().length === 0;
}
const _formatRegexp = /{(\d+)}/g;
/**
 * Helper to produce a string with a variable number of arguments. Insert variable segments
 * into the string using the {n} notation where N is the index of the argument following the string.
 * @param value string to which formatting is applied
 * @param args replacements for {n}-entries
 */
function format(value, ...args) {
    if (args.length === 0) {
        return value;
    }
    return value.replace(_formatRegexp, function (match, group) {
        const idx = parseInt(group, 10);
        return isNaN(idx) || idx < 0 || idx >= args.length ?
            match :
            args[idx];
    });
}
const _format2Regexp = /{([^}]+)}/g;
/**
 * Helper to create a string from a template and a string record.
 * Similar to `format` but with objects instead of positional arguments.
 */
function format2(template, values) {
    if (Object.keys(values).length === 0) {
        return template;
    }
    return template.replace(_format2Regexp, (match, group) => (values[group] ?? match));
}
/**
 * Encodes the given value so that it can be used as literal value in html attributes.
 *
 * In other words, computes `$val`, such that `attr` in `<div attr="$val" />` has the runtime value `value`.
 * This prevents XSS injection.
 */
function htmlAttributeEncodeValue(value) {
    return value.replace(/[<>"'&]/g, ch => {
        switch (ch) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case '\'': return '&apos;';
            case '&': return '&amp;';
        }
        return ch;
    });
}
/**
 * Converts HTML characters inside the string to use entities instead. Makes the string safe from
 * being used e.g. in HTMLElement.innerHTML.
 */
function escape(html) {
    return html.replace(/[<>&]/g, function (match) {
        switch (match) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            default: return match;
        }
    });
}
/**
 * Escapes regular expression characters in a given string
 */
function escapeRegExpCharacters(value) {
    return value.replace(/[\\\{\}\*\+\?\|\^\$\.\[\]\(\)]/g, '\\$&');
}
/**
 * Counts how often `substr` occurs inside `value`.
 */
function count(value, substr) {
    let result = 0;
    let index = value.indexOf(substr);
    while (index !== -1) {
        result++;
        index = value.indexOf(substr, index + substr.length);
    }
    return result;
}
function truncate(value, maxLength, suffix = '…') {
    if (value.length <= maxLength) {
        return value;
    }
    return `${value.substr(0, maxLength)}${suffix}`;
}
function truncateMiddle(value, maxLength, suffix = '…') {
    if (value.length <= maxLength) {
        return value;
    }
    const prefixLength = Math.ceil(maxLength / 2) - suffix.length / 2;
    const suffixLength = Math.floor(maxLength / 2) - suffix.length / 2;
    return `${value.substr(0, prefixLength)}${suffix}${value.substr(value.length - suffixLength)}`;
}
/**
 * Removes all occurrences of needle from the beginning and end of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim (default is a blank)
 */
function trim(haystack, needle = ' ') {
    const trimmed = ltrim(haystack, needle);
    return rtrim(trimmed, needle);
}
/**
 * Removes all occurrences of needle from the beginning of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
function ltrim(haystack, needle) {
    if (!haystack || !needle) {
        return haystack;
    }
    const needleLen = needle.length;
    if (needleLen === 0 || haystack.length === 0) {
        return haystack;
    }
    let offset = 0;
    while (haystack.indexOf(needle, offset) === offset) {
        offset = offset + needleLen;
    }
    return haystack.substring(offset);
}
/**
 * Removes all occurrences of needle from the end of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
function rtrim(haystack, needle) {
    if (!haystack || !needle) {
        return haystack;
    }
    const needleLen = needle.length, haystackLen = haystack.length;
    if (needleLen === 0 || haystackLen === 0) {
        return haystack;
    }
    let offset = haystackLen, idx = -1;
    while (true) {
        idx = haystack.lastIndexOf(needle, offset - 1);
        if (idx === -1 || idx + needleLen !== offset) {
            break;
        }
        if (idx === 0) {
            return '';
        }
        offset = idx;
    }
    return haystack.substring(0, offset);
}
function convertSimple2RegExpPattern(pattern) {
    return pattern.replace(/[\-\\\{\}\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&').replace(/[\*]/g, '.*');
}
function stripWildcards(pattern) {
    return pattern.replace(/\*/g, '');
}
function createRegExp(searchString, isRegex, options = {}) {
    if (!searchString) {
        throw new Error('Cannot create regex from empty string');
    }
    if (!isRegex) {
        searchString = escapeRegExpCharacters(searchString);
    }
    if (options.wholeWord) {
        if (!/\B/.test(searchString.charAt(0))) {
            searchString = '\\b' + searchString;
        }
        if (!/\B/.test(searchString.charAt(searchString.length - 1))) {
            searchString = searchString + '\\b';
        }
    }
    let modifiers = '';
    if (options.global) {
        modifiers += 'g';
    }
    if (!options.matchCase) {
        modifiers += 'i';
    }
    if (options.multiline) {
        modifiers += 'm';
    }
    if (options.unicode) {
        modifiers += 'u';
    }
    return new RegExp(searchString, modifiers);
}
function regExpLeadsToEndlessLoop(regexp) {
    // Exit early if it's one of these special cases which are meant to match
    // against an empty string
    if (regexp.source === '^' || regexp.source === '^$' || regexp.source === '$' || regexp.source === '^\\s*$') {
        return false;
    }
    // We check against an empty string. If the regular expression doesn't advance
    // (e.g. ends in an endless loop) it will match an empty string.
    const match = regexp.exec('');
    return !!(match && regexp.lastIndex === 0);
}
function splitLines(str) {
    return str.split(/\r\n|\r|\n/);
}
function splitLinesIncludeSeparators(str) {
    const linesWithSeparators = [];
    const splitLinesAndSeparators = str.split(/(\r\n|\r|\n)/);
    for (let i = 0; i < Math.ceil(splitLinesAndSeparators.length / 2); i++) {
        linesWithSeparators.push(splitLinesAndSeparators[2 * i] + (splitLinesAndSeparators[2 * i + 1] ?? ''));
    }
    return linesWithSeparators;
}
/**
 * Returns first index of the string that is not whitespace.
 * If string is empty or contains only whitespaces, returns -1
 */
function firstNonWhitespaceIndex(str) {
    for (let i = 0, len = str.length; i < len; i++) {
        const chCode = str.charCodeAt(i);
        if (chCode !== charCode_1.CharCode.Space && chCode !== charCode_1.CharCode.Tab) {
            return i;
        }
    }
    return -1;
}
/**
 * Returns the leading whitespace of the string.
 * If the string contains only whitespaces, returns entire string
 */
function getLeadingWhitespace(str, start = 0, end = str.length) {
    for (let i = start; i < end; i++) {
        const chCode = str.charCodeAt(i);
        if (chCode !== charCode_1.CharCode.Space && chCode !== charCode_1.CharCode.Tab) {
            return str.substring(start, i);
        }
    }
    return str.substring(start, end);
}
/**
 * Returns last index of the string that is not whitespace.
 * If string is empty or contains only whitespaces, returns -1
 */
function lastNonWhitespaceIndex(str, startIndex = str.length - 1) {
    for (let i = startIndex; i >= 0; i--) {
        const chCode = str.charCodeAt(i);
        if (chCode !== charCode_1.CharCode.Space && chCode !== charCode_1.CharCode.Tab) {
            return i;
        }
    }
    return -1;
}
/**
 * Function that works identically to String.prototype.replace, except, the
 * replace function is allowed to be async and return a Promise.
 */
function replaceAsync(str, search, replacer) {
    const parts = [];
    let last = 0;
    for (const match of str.matchAll(search)) {
        parts.push(str.slice(last, match.index));
        if (match.index === undefined) {
            throw new Error('match.index should be defined');
        }
        last = match.index + match[0].length;
        parts.push(replacer(match[0], ...match.slice(1), match.index, str, match.groups));
    }
    parts.push(str.slice(last));
    return Promise.all(parts).then(p => p.join(''));
}
function compare(a, b) {
    if (a < b) {
        return -1;
    }
    else if (a > b) {
        return 1;
    }
    else {
        return 0;
    }
}
function compareSubstring(a, b, aStart = 0, aEnd = a.length, bStart = 0, bEnd = b.length) {
    for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
        const codeA = a.charCodeAt(aStart);
        const codeB = b.charCodeAt(bStart);
        if (codeA < codeB) {
            return -1;
        }
        else if (codeA > codeB) {
            return 1;
        }
    }
    const aLen = aEnd - aStart;
    const bLen = bEnd - bStart;
    if (aLen < bLen) {
        return -1;
    }
    else if (aLen > bLen) {
        return 1;
    }
    return 0;
}
function compareIgnoreCase(a, b) {
    return compareSubstringIgnoreCase(a, b, 0, a.length, 0, b.length);
}
function compareSubstringIgnoreCase(a, b, aStart = 0, aEnd = a.length, bStart = 0, bEnd = b.length) {
    for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
        let codeA = a.charCodeAt(aStart);
        let codeB = b.charCodeAt(bStart);
        if (codeA === codeB) {
            // equal
            continue;
        }
        if (codeA >= 128 || codeB >= 128) {
            // not ASCII letters -> fallback to lower-casing strings
            return compareSubstring(a.toLowerCase(), b.toLowerCase(), aStart, aEnd, bStart, bEnd);
        }
        // mapper lower-case ascii letter onto upper-case varinats
        // [97-122] (lower ascii) --> [65-90] (upper ascii)
        if (isLowerAsciiLetter(codeA)) {
            codeA -= 32;
        }
        if (isLowerAsciiLetter(codeB)) {
            codeB -= 32;
        }
        // compare both code points
        const diff = codeA - codeB;
        if (diff === 0) {
            continue;
        }
        return diff;
    }
    const aLen = aEnd - aStart;
    const bLen = bEnd - bStart;
    if (aLen < bLen) {
        return -1;
    }
    else if (aLen > bLen) {
        return 1;
    }
    return 0;
}
function isAsciiDigit(code) {
    return code >= charCode_1.CharCode.Digit0 && code <= charCode_1.CharCode.Digit9;
}
function isLowerAsciiLetter(code) {
    return code >= charCode_1.CharCode.a && code <= charCode_1.CharCode.z;
}
function isUpperAsciiLetter(code) {
    return code >= charCode_1.CharCode.A && code <= charCode_1.CharCode.Z;
}
function equalsIgnoreCase(a, b) {
    return a.length === b.length && compareSubstringIgnoreCase(a, b) === 0;
}
function startsWithIgnoreCase(str, candidate) {
    const candidateLength = candidate.length;
    if (candidate.length > str.length) {
        return false;
    }
    return compareSubstringIgnoreCase(str, candidate, 0, candidateLength) === 0;
}
/**
 * @returns the length of the common prefix of the two strings.
 */
function commonPrefixLength(a, b) {
    const len = Math.min(a.length, b.length);
    let i;
    for (i = 0; i < len; i++) {
        if (a.charCodeAt(i) !== b.charCodeAt(i)) {
            return i;
        }
    }
    return len;
}
/**
 * @returns the length of the common suffix of the two strings.
 */
function commonSuffixLength(a, b) {
    const len = Math.min(a.length, b.length);
    let i;
    const aLastIndex = a.length - 1;
    const bLastIndex = b.length - 1;
    for (i = 0; i < len; i++) {
        if (a.charCodeAt(aLastIndex - i) !== b.charCodeAt(bLastIndex - i)) {
            return i;
        }
    }
    return len;
}
/**
 * See http://en.wikipedia.org/wiki/Surrogate_pair
 */
function isHighSurrogate(charCode) {
    return (0xD800 <= charCode && charCode <= 0xDBFF);
}
/**
 * See http://en.wikipedia.org/wiki/Surrogate_pair
 */
function isLowSurrogate(charCode) {
    return (0xDC00 <= charCode && charCode <= 0xDFFF);
}
/**
 * See http://en.wikipedia.org/wiki/Surrogate_pair
 */
function computeCodePoint(highSurrogate, lowSurrogate) {
    return ((highSurrogate - 0xD800) << 10) + (lowSurrogate - 0xDC00) + 0x10000;
}
/**
 * get the code point that begins at offset `offset`
 */
function getNextCodePoint(str, len, offset) {
    const charCode = str.charCodeAt(offset);
    if (isHighSurrogate(charCode) && offset + 1 < len) {
        const nextCharCode = str.charCodeAt(offset + 1);
        if (isLowSurrogate(nextCharCode)) {
            return computeCodePoint(charCode, nextCharCode);
        }
    }
    return charCode;
}
/**
 * get the code point that ends right before offset `offset`
 */
function getPrevCodePoint(str, offset) {
    const charCode = str.charCodeAt(offset - 1);
    if (isLowSurrogate(charCode) && offset > 1) {
        const prevCharCode = str.charCodeAt(offset - 2);
        if (isHighSurrogate(prevCharCode)) {
            return computeCodePoint(prevCharCode, charCode);
        }
    }
    return charCode;
}
class CodePointIterator {
    get offset() {
        return this._offset;
    }
    constructor(str, offset = 0) {
        this._str = str;
        this._len = str.length;
        this._offset = offset;
    }
    setOffset(offset) {
        this._offset = offset;
    }
    prevCodePoint() {
        const codePoint = getPrevCodePoint(this._str, this._offset);
        this._offset -= (codePoint >= uint_1.Constants.UNICODE_SUPPLEMENTARY_PLANE_BEGIN ? 2 : 1);
        return codePoint;
    }
    nextCodePoint() {
        const codePoint = getNextCodePoint(this._str, this._len, this._offset);
        this._offset += (codePoint >= uint_1.Constants.UNICODE_SUPPLEMENTARY_PLANE_BEGIN ? 2 : 1);
        return codePoint;
    }
    eol() {
        return (this._offset >= this._len);
    }
}
exports.CodePointIterator = CodePointIterator;
exports.noBreakWhitespace = '\xa0';
