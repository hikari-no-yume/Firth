var tokenTypes = require('./token-types');
var valueTypes = require('./value-types');

/* takes a script text
 * produces list of tokens
 */
module.exports = function(script) {
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
        if (c === '.') {
            tokens.push(new tokenTypes.Invoke());
            i++;
            continue;
        }

        if (c === '[') {
            tokens.push(new tokenTypes.FunctionOpening());
            i++;
            continue;
        }

        if (c === ']') {
            tokens.push(new tokenTypes.FunctionClosing());
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
            tokens.push(new tokenTypes.Literal(new valueTypes.symbol(symbol)));
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
                tokens.push(new tokenTypes.Literal(new valueTypes.boolean(token)));
            } else {
                tokens.push(new tokenTypes.VariableName(token));
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

            tokens.push(new tokenTypes.Literal(new valueTypes.integer(digits)));
            continue;
        }

        /* 'string' */
        if (c === "'") {
            var string = '';

            i++;
            if (!(i < len)) {
                throw new Error("Unexpected end of script: unterminated string");
            } else {
                c = script[i];
            }

            while (c !== "'") {
                if (c === '\\') {
                    i++;
                    if (i < len) {
                        c = script[i];
                    } else {
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
                i++;
                if (i < len) {
                    c = script[i];
                } else {
                    throw new Error("Unexpected end of script: unterminated string");
                }
            }

            i++;
            tokens.push(new tokenTypes.Literal(new valueTypes.string(string)));
            continue;
        }

        throw new Error("Unexpected character '" + c + "' on line " + line);
    }

    return tokens;
};
