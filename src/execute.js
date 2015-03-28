'use strict';

/* takes an AST and executes it!
 * this operates on the given stack and inherits the given scope */
function execute(ast, stack, scope) {
    /* JavaScript's prototypes make creating a scope chain easy :D */
    var scope = Object.create(scope);

    for (var i = 0; i < ast.length; i++) {
        var opcode = ast[i];
        switch (opcode.type) {
            case 'boolean':
            case 'integer':
            case 'symbol':
            case 'function':
                stack.push(opcode);
                break;
            case 'variable':
                /* we can't use hasOwnProperty as we want to go up scope chain */
                if (scope[opcode.name] !== undefined) {
                    stack.push(scope[opcode.name]);
                } else {
                    throw new Error("No variable named \"" + opcode.name + "\"");
                }
                break;
           case 'invoke':
                var func = stack.pop();
                if (func.type === 'function') {
                    func.invoke(stack, scope);
                } else {
                    throw new Error("Cannot invoke value of type " + func.type);
                }
                break;
            default:
                throw new Error("Unhandled opcode type " + opcode.type);
        }
    }

    return scope;
}

module.exports = execute;
