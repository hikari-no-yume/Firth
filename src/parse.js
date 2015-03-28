var types = require('./types.js');

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
        if (curTok.type === '[') {
            dequeue();

            var innerOpcodes = _parse(tokens, true);
            if (!tokens.length || tokens[tokens.length - 1].type !== ']') {
                throw new Error("Missing end ] in function");
            }
            dequeue(); /* pop off ] */

            opcodes.push(new types.FuncValue(innerOpcodes));
            continue;
        /* function body end */
        } else if (curTok.type === ']') {
            if (recursion) {
                /* allows recursive parsing */
                return opcodes;
            } else {
                throw new Error("Mismatched ]");
            }
        } else {
            dequeue();
            opcodes.push(curTok);
            continue;
        }
    }

    return opcodes;
};
