module.exports = (function (Firth) {
    'use strict';

    var executor = {};
    var Stack = require('./Stack');
    var stdlib = require('./stdlib')(executor);

    /* takes an AST and executes it! */
    function execute(ast) {
        var stack = new Stack(),
            scope = stdlib;

        _execute(ast, stack, scope);
    }

    /* internal execution function
     * this operates on the given stack and inherits the given scope */
    function _execute(ast, stack, scope) {
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
                    invokeFunction(func, stack, scope);
                    break;
                default:
                    throw new Error("Unhandled opcode type " + opcode.type);
            }
        }
    }

    function invokeFunction(func, stack, scope) {
        if (func.type === 'function') {
            _execute(func.body, stack, scope);
        } else if (typeof func === 'function') {
           func(stack, scope);
        } else {
            throw new Error("Cannot invoke value of type " + func.type);
        }
    }

    executor.execute = execute;
    executor.invokeFunction = invokeFunction;

    return executor;
}());
