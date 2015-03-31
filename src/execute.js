'use strict';

/* takes an AST and executes it!
 * this operates on the given stack and inherits the given scope */
function execute(ast, stack, scope) {
    /* JavaScript's prototypes make creating a scope chain easy :D */
    var scope = Object.create(scope);

    ast.forEach(function (opcode) {
        opcode.execute(stack, scope);
    });

    return scope;
}

module.exports = execute;
