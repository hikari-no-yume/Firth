window.Firth.stdlib = (function (Firth) {
    'use strict';

    /* this is built up procedurally */
    var stdlib = {};

    /* used to enforce internal function types */
    function typeCheck(name, consumes, produces, func) {
        return function (stack, scope) {
            var initialHeight = stack.getHeight();
            if (initialHeight < consumes.length) {
                throw new Error(name + " expects " + consumes.length + " arguments, stack height is " + initialHeight);
            }
            for (var i = 0; i < consumes.length; i++) {
                var actualType = stack.peek(consumes.length - 1 - i).type,
                    expectedType = consumes[i];
                if (expectedType !== 'any' && actualType !== expectedType) {
                    throw new Error(name + " expects argument " + (i + 1) + " to be of the type " + expectedType + ", " + actualType + " given");
                }
            }

            func(stack, scope);

            var resultHeight = stack.getHeight(),
                expectedHeight = initialHeight - consumes.length + produces.length,
                diff = expectedHeight - resultHeight;
            if (diff) {
                throw new Error(name + " should consume " + consumes.length + " arguments and produce " + produces.length + " results, stack is " + Math.abs(diff) + " values too " + (diff > 0 ? "low" : "high"));
            }
            for (var i = 0; i < produces.length; i++) {
                var actualType = stack.peek(produces.length - 1 - i).type,
                    expectedType = produces[i];
                if (expectedType !== 'any' && actualType !== expectedType) {
                    throw new Error("Result " + (i + 1) + " of " + name + " should be of the type " + expectedType + ", " + actualType + " produced");
                }
            }
        };
    }

    function defun(name, func) {
        stdlib[name] = func;
    }

    function defunTyped(name, consumes, produces, func) {
        defun(name, typeCheck(name, consumes, produces, func));
    }

    // Language Spec § Functions § Variable Definition

    defunTyped('def', ['symbol', 'function'], [], function (stack, scope) {
        var value = stack.pop();
        var name = stack.pop();
        
        if (scope.hasOwnProperty(name)) {
            throw new Error("Cannot redefine variable \"" + name + "\"");
        } else {
            scope[name.name] = value;
        }
    });

    // Language Spec § Functions § Stack Manipulation

    defunTyped('dup', ['any'], ['any', 'any'], function (stack, scope) {
        var value = stack.pop();
        stack.push(value);
        stack.push(value);
    });
    defunTyped('drop', ['any'], [], function (stack, scope) {
        stack.pop();
    });
    defunTyped('swap', ['any', 'any'], ['any', 'any'], function (stack, scope) {
        var value1 = stack.pop();
        var value2 = stack.pop();
        stack.push(value1);
        stack.push(value2);
    });

    // Language Spec § Functions § Flow Control

    defun('if', function (stack, scope) {
        var trueCase = stack.pop();
        var condition = stack.pop();

        if (trueCase.type !== 'function' || condition.type !== 'boolean') {
            throw new Error('if takes a function and a boolean, ' + trueCase.type + ' and ' + condition.type + ' given');
        }

        if (condition.value) {
            Firth.executor.invokeFunction(trueCase, stack, scope);
        }
    });
    defun('ifelse', function (stack, scope) {
        var falseCase = stack.pop();
        var trueCase = stack.pop();
        var condition = stack.pop();

        if (falseCase.type !== 'function' || trueCase.type !== 'function' || condition.type !== 'boolean') {
            throw new Error('ifelse takes two functions and a boolean, ' + falseCase.type + ', ' + trueCase.type + ' and ' + condition.type + ' given');
        }

        Firth.executor.invokeFunction(condition.value ? trueCase : falseCase, stack, scope);
    });

    // Language Spec § Functions § Integer Arithmetic

    /* convenience function to avoid boilerplate for integer math functions */
    function defunIntBinop(name, func) {
        defunTyped(name, ['integer', 'integer'], ['integer'], function (stack, scope) {
            var value2 = stack.pop();
            var value1 = stack.pop();

            var result = func(value1.value, value2.value);
            Firth.utils.checkOverflow(result);

            stack.push({
                type: 'integer',
                value: result
            });
        });
    }
    
    defunIntBinop('add', function (a, b) {
        return a + b;
    });
    defunIntBinop('sub', function (a, b) {
        return a - b;
    });
    defunIntBinop('mul', function (a, b) {
        return a * b;
    });
    defunIntBinop('div', function (a, b) {
        /* floor division */
        return Math.floor(a / b);
    });
    defunIntBinop('mod', function (a, b) {
        /* remainder with the sign of the divisor */
        return ((a % b) + b) % b; 
    });
    defunTyped('divmod', ['integer', 'integer'], ['integer', 'integer'], function (stack, scope) {
        var value2 = stack.pop();
        var value1 = stack.pop();

        var result1 = Math.floor(value1.value / value2.value);
        Firth.utils.checkOverflow(result1);
        var result2 = ((value1.value % value2.value) + value2.value) % value2.value;
        Firth.utils.checkOverflow(result2);

        stack.push({
            type: 'integer',
            value: result1
        });
        stack.push({
            type: 'integer',
            value: result2
        });
    });

    // Language Spec § Functions § Comparison
    
    defunTyped('gt', ['integer', 'integer'], ['boolean'], function (stack, scope) {
        var value2 = stack.pop();
        var value1 = stack.pop();

        stack.push({
            type: 'boolean',
            value: value1.value > value2.value
        });
    });

    // Non-standard functions

    defunTyped('show', ['any'], [], function (stack, scope) {
        var value = stack.pop();

        alert(JSON.stringify(value, null, 4));
    });

    return stdlib;
}(window.Firth));
