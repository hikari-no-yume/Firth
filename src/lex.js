var tokenTypes = require('./token-types');
var valueTypes = require('./value-types');

/* takes a script text
 * produces list of tokens
 */
module.exports = function(script) {
    var i = 0,
        lasti = -1,
        line = 1,
        len = script.length,
        tokens = [];

    function tryAdvance() {
        i++;
        if (i < len) {
            c = script[i];
            return true;
        } else {
            return false;
        }
    }

    function advance() {
        if (!tryAdvance()) {
            throw new Error("Unexpected end of script: unterminated string");
        }
    }

    function isWhitespace(c) {
        return c === ' ' || c === '\n' || c === '\r' || c === '\t';
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
                if (!tryAdvance()) {
                    break;
                }
            }
            continue;
        }

        /* punctuation (braces, dots) */
        if (c === '.') {
            tokens.push(tokenTypes.Invoke());
            i++;
            continue;
        }

        if (c === '[') {
            tokens.push(tokenTypes.FunctionOpening());
            i++;
            continue;
        }

        if (c === ']') {
            tokens.push(tokenTypes.FunctionClosing());
            i++;
            continue;
        }

        /* /symbol */
        if (c === '/') {
            advance();
            if (!isIdentifierLead(c)) {
                throw new Error("Unexpected '" + c + "' at start of symbol, underscore or letter expected on line " + line);
            }
            var symbol = '';
            while (isIdentifierTrail(c)) {
                symbol += c;
                if (!tryAdvance()) {
                    break;
                }
            }
            tokens.push(tokenTypes.Literal(valueTypes.symbol(symbol)));
            continue;
        }

        /* variable name */
        if (isIdentifierLead(c)) {
            var token = '';
            while (isIdentifierTrail(c)) {
                token += c;
                if (!tryAdvance()) {
                    break;
                }
            }
            if (token === 'true' || token === 'false') {
                tokens.push(tokenTypes.Literal(valueTypes.boolean(token)));
            } else {
                tokens.push(tokenTypes.VariableName(token));
            }
            continue;
        }

        /* integer literal */
        if (c === '-' || c === '+' || isDigit(c)) {
            var digits = '';
            if (c === '-' || c === '+') {
                digits += c;
                if (!tryAdvance()) {
                    throw new Error("Unexpected EOF in integer literal, expected digits on line " + line);
                }
                if (!isDigit(c)) {
                    throw new Error("Unexpected '" + c + "' following sign, expected digits on line " + line);
                }
            }

            while (isDigit(c)) {
                digits += c;
                if (!tryAdvance()) {
                    break;
                }
            }

            tokens.push(tokenTypes.Literal(valueTypes.integer(digits)));
            continue;
        }

        /* 'string' */
        if (c === "'") {
            var string = '';

            if (!tryAdvance()) {
                throw new Error("Unexpected end of script: unterminated string");
            }
            while (c !== "'") {
                if (c === '\\') {
                    if (!tryAdvance()) {
                        throw new Error("Unexpected end of script: unterminated string");
                    }
                    if (c === '\\' || c === "'") {
                        string += c;
                    } else if (c === 'n') {
                        string += '\n';
                    } else if (c === 'r') {
                        string += '\r';
                    } else {
                        throw new Error("\\" + c + " is not a valid escape sequence");
                    }
                } else {
                    string += c;
                }
                if (!tryAdvance()) {
                    throw new Error("Unexpected end of script: unterminated string");
                }
            }

            i++;
            tokens.push(tokenTypes.Literal(valueTypes.string(string)));
            continue;
        }

        throw new Error("Unexpected character '" + c + "' on line " + line);
    }

    return tokens;
};
