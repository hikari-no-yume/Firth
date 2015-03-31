var valueTypes = require('./value-types');

var Opcode = function Opcode(name, source) {
    return {
        getName: function() {
            return name;
        },
        getSource: function() {
            return source;
        },
        execute: function(stack, scope) {
            throw new Error('Unhandled opcode: ' + this);
        },
        toString: function() {
            return 'opcode:' + name;
        }
    }
};


var PushValue = function PushValueOpcode(value) {
    var that = Opcode('push-value', value);
    that.toString = function() {
        return 'opcode:push-value(' + value + ')';
    };
    that.execute = function(stack) {
        stack.push(value);
    };
    return that;
};


var PushVariable = function PushVariableOpcode(variable) {
    var that = Opcode('push-variable', variable);
    that.toString = function() {
        return 'opcode:push-variable(' + variable + ')';
    };
    that.execute = function(stack, scope) {
        if (scope[variable] !== undefined) {
            stack.push(scope[variable]);
        } else {
            throw new Error('No variable named \'' + variable + '\'');
        }
    };
    return that;
};


var Invoke = function InvokeOpcode() {
    var that = Opcode('invoke', '.');
    that.execute = function(stack, scope) {
        var func = stack.pop();
        if (func.getType() === 'function') {
            func.invoke(stack, scope);
        } else {
            throw new Error('Cannot invoke value of type ' + func.getType() + ' : ' + func);
        }
    };
    return that;
};


module.exports = {
    PushValue:    PushValue,
    PushVariable: PushVariable,
    Invoke:       Invoke
};
