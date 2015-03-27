var utils = require('./utils');

/* takes a script text
 * produces list of tokens
 */
module.exports = function(script) {
    function isWhitespace(c) {
        return c === ' ' || c === '\n' || c === '\r' || c === '\t';
    }

    function isPunctuation(c) {
        return c === '.' || c === '[' || c === ']';
    }

    function isIdentifierLead(c) {
        return 'a' <= c && c <= 'z';
    }

    function isDigit(c) {
        return '0' <= c && c <= '9';
    }

    function isIdentifierTrail(c) {
        return isIdentifierLead(c) || isDigit(c) || c === '-';
    }

    var i = 0,
        lasti = -1,
        line = 1,
        len = script.length,
        tokens = [];

    while (i < len) {
        var c = script[i];

        /* This catches out potential infinite loops */
        if (i === lasti) {
            throw new Error("repeat! D:");
        } else {
            lasti = i;
        }

        /* whitespace */
        if (isWhitespace(c)) {
            if (c === '\t') {
                throw new Error("Tabs are bad and you should feel bad on line " + line);
            } else if (c === '\n') {
                line++;
            }
            i++;
            continue;
        }

        /* ; comment */
        if (c === ';') {
            while (c !== '\n') {
                i++;
                if (i < len) {
                    c = script[i];
                } else {
                    break;
                }
            }
            continue;
        }

        /* punctuation (braces, dots) */
        if (isPunctuation(c)) {
            tokens.push({
                type: (c === '.') ? 'invoke' : c
            });
            i++;
            continue;
        }

        /* /symbol */
        if (c === '/') {
            i++;
            if (!(i < len)) {
                throw new Error("Unexpected EOF in symbol on line " + line);
            }
            c = script[i];
            if (!isIdentifierLead(c)) {
                throw new Error("Unexpected '" + c + "' at start of symbol, underscore or letter expected on line " + line);
            }
            var symbol = '';
            while (isIdentifierTrail(c)) {
                symbol += c;
                i++;
                if (i < len) {
                    c = script[i];
                } else {
                    break;
                }
            }
            tokens.push({
                type: 'symbol',
                name: symbol
            });
            continue;
        }

        /* variable name */
        if (isIdentifierLead(c)) {
            var token = '';
            while (isIdentifierTrail(c)) {
                token += c;
                i++;
                if (i < len) {
                    c = script[i];
                } else {
                    break;
                }
            }
            if (token === 'true' || token === 'false') {
                tokens.push({
                    type: 'boolean',
                    value: token === 'true'
                });
            } else {
                tokens.push({
                    type: 'variable',
                    name: token
                });
            }
            continue;
        }

        /* integer literal */
        if (c === '-' || c === '+' || isDigit(c)) {
            var digits = '';
            if (c === '-' || c === '+') {
                digits += c;
                i++;
                if (!(i < len)) {
                    throw new Error("Unexpected EOF in integer literal, expected digits on line " + line);
                } else {
                    c = script[i];
                }
                if (!isDigit(c)) {
                    throw new Error("Unexpected '" + c + "' following sign, expected digits on line " + line);
                }
            }

            while (isDigit(c)) {
                digits += c;
                i++;
                if (i < len) {
                    c = script[i];
                } else {
                    break;
                }
            }

            var integer = parseInt(digits, 10);
            /* this shouldn't happen, but let's be careful */
            if (isNaN(integer)) {
                throw new Error("integer is NaN?!?");
            }
            utils.checkOverflow(integer);

            tokens.push({
                type: 'integer',
                value: integer
            });
            continue;
        }

        throw new Error("Unexpected character '" + c + "' on line " + line);
    }

    return tokens;
};
