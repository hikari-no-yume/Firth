var tokenTypes = require('./token-types');
var opcodeTypes = require('./opcode-types');
var valueTypes = require('./value-types');

/* since this is a stack-oriented language, the only syntactical analysis
 * needed is to handle function braces - and even that is not strictly
 * necessary (but we do it to make this workable for optimisation)
 *
 * this takes a list of tokens, and produces an AST */
module.exports = function parse(tokens) {
    /* reverse and copy array so it can be used like a queue */
    return _parse(tokens.slice(0).reverse());
}

/* internal (destructive, queue-oriented) parse function */
function _parse(tokens, recursion) {
    function head() {
        return tokens[tokens.length - 1];
    }

    function dequeue() {
        return tokens.pop();
    }

    var opcodes = [],
        recursion = recursion || false;
    while (tokens.length) {
        var curTok = head();
        /* function body start */
        if (curTok.getName() === 'function-opening') {
            dequeue();

            var innerOpcodes = _parse(tokens, true);
            if (!tokens.length || tokens[tokens.length - 1].getName() !== 'function-closing') {
                throw new Error("Missing end ] in function");
            }
            dequeue(); /* pop off ] */

            opcodes.push(opcodeTypes.PushValue(valueTypes['user-function'](innerOpcodes)));
            continue;
        /* function body end */
        } else if (curTok.getName() === 'function-closing') {
            if (recursion) {
                /* allows recursive parsing */
                return opcodes;
            } else {
                throw new Error("Mismatched ]");
            }
        } else if (curTok.getName() === 'literal') {
            dequeue();
            opcodes.push(opcodeTypes.PushValue(curTok.getValue()));
            continue;
        } else if (curTok.getName() === 'variable-name') {
            dequeue();
            opcodes.push(opcodeTypes.PushVariable(curTok.getValue()));
            continue;
        } else if (curTok.getName() === 'invoke') {
            dequeue();
            opcodes.push(opcodeTypes.Invoke());
            continue;
        } else {
            throw new Error("Unexpected " + curTok);
        }
    }

    return opcodes;
};
