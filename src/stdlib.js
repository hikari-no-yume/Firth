var valueTypes = require('./value-types');
var execute = require('./execute.js');

/* this is built up procedurally */
var stdlib = {};

/* used to enforce internal function types */
function typeCheck(name, consumes, produces, func) {
    return new valueTypes['internal-function'](function (stack, scope) {
        var initialHeight = stack.getHeight();
        if (initialHeight < consumes.length) {
            throw new Error(name + " expects " + consumes.length + " arguments, stack height is " + initialHeight);
        }
        for (var i = 0; i < consumes.length; i++) {
            var actualType = stack.peek(consumes.length - 1 - i).getType(),
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
            var actualType = stack.peek(produces.length - 1 - i).getType(),
                expectedType = produces[i];
            if (expectedType !== 'any' && actualType !== expectedType) {
                throw new Error("Result " + (i + 1) + " of " + name + " should be of the type " + expectedType + ", " + actualType + " produced");
            }
        }
    }, name);
}

function defun(name, func) {
    stdlib[name] = new valueTypes['internal-function'](func, name);
}

function defunTyped(name, consumes, produces, func) {
    stdlib[name] = typeCheck(name, consumes, produces, func);
}

// Language Spec § Functions § Variable Definition

defunTyped('def', ['symbol', 'any'], [], function (stack, scope) {
    var value = stack.pop();
    var name = stack.pop().getValue();

    if (scope.hasOwnProperty(name)) {
        throw new Error("Cannot redefine variable \"" + name + "\"");
    } else {
        scope[name] = value;
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

    if (trueCase.getType() !== 'function' || condition.getType() !== 'boolean') {
        throw new Error('if takes a function and a boolean, ' + trueCase.getType() + ' and ' + condition.getType() + ' given');
    }

    if (condition.getValue()) {
        trueCase.invoke(stack, scope);
    }
});
defun('ifelse', function (stack, scope) {
    var falseCase = stack.pop();
    var trueCase = stack.pop();
    var condition = stack.pop();

    if (falseCase.getType() !== 'function' || trueCase.getType() !== 'function' || condition.getType() !== 'boolean') {
        throw new Error('ifelse takes two functions and a boolean, ' + falseCase + ', ' + trueCase + ' and ' + condition + ' given');
    }

    if (condition.getValue()) {
        trueCase.invoke(stack, scope);
    } else {
        falseCase.invoke(stack, scope);
    }
});

// Language Spec § Functions § Integer Arithmetic

/* convenience function to avoid boilerplate for integer math functions */
function defunIntBinop(name, func) {
    defunTyped(name, ['integer', 'integer'], ['integer'], function (stack, scope) {
        var value2 = stack.pop();
        var value1 = stack.pop();

        stack.push(func(value1, value2));
    });
}

defunIntBinop('add', function (a, b) {
    return a.add(b);
});
defunIntBinop('sub', function (a, b) {
    return a.sub(b);
});
defunIntBinop('mul', function (a, b) {
    return a.mul(b);
});
defunIntBinop('div', function (a, b) {
    return a.div(b);
});
defunIntBinop('mod', function (a, b) {
    return a.mod(b);
});
defunIntBinop('pow', function (a, b) {
    return a.pow(b);
});
defunTyped('sqrt', ['integer'], ['integer'], function (stack, scope) {
    stack.push(valueTypes.integer(Math.sqrt(stack.pop())));
});
defunTyped('divmod', ['integer', 'integer'], ['integer', 'integer'], function (stack, scope) {
    var value2 = stack.pop();
    var value1 = stack.pop();

    stack.push(a.div(b));
    stack.push(a.mod(b));
});

// Language Spec § Functions § Comparison

/* convenience function to avoid boilerplate for comparison functions */
function defunIntComparison(name, func) {
    defunTyped(name, ['integer', 'integer'], ['boolean'], function (stack, scope) {
        var value2 = stack.pop();
        var value1 = stack.pop();

        stack.push(new valueTypes.boolean(func(value1, value2)));
    });
}

defunIntComparison('gt', function (a, b) {
    return a.compare(b) === 1;
});
defunIntComparison('gteq', function (a, b) {
    return a.compare(b) >= 0;
});
defunIntComparison('lt', function (a, b) {
    return a.compare(b) === -1;
});
defunIntComparison('lteq', function (a, b) {
    return a.compare(b) <= 0;
});

// Language Spec § Functions § Boolean Algebra

defunTyped('and', ['boolean', 'boolean'], ['boolean'], function (stack, scope) {
    var value2 = stack.pop();
    var value1 = stack.pop();

    stack.push(value1.and(value2));
});

defunTyped('or', ['boolean', 'boolean'], ['boolean'], function (stack, scope) {
    var value2 = stack.pop();
    var value1 = stack.pop();

    stack.push(value1.or(value2));
});

defunTyped('xor', ['boolean', 'boolean'], ['boolean'], function (stack, scope) {
    var value2 = stack.pop();
    var value1 = stack.pop();

    stack.push(value1.xor(value2));
});

defunTyped('not', ['boolean'], ['boolean'], function (stack, scope) {
    var value = stack.pop();

    stack.push(value.not());
});

// Non-standard functions

defunTyped('show', ['any'], [], function (stack, scope) {
    var value = stack.pop();

    (typeof alert === 'undefined' ? console.log : alert)(value.toString());
});

module.exports = stdlib;
