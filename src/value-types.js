var execute = require('./execute');

var Value = function Value(type, value) {
    return {
        getType: function() {
            return type;
        },
        getValue: function() {
            return value;
        },
        equals: function(b) {
            return type === b.getType() && value === b.getValue();
        },
        toString: function() {
            return value;
        }
    }
};

function SymbolValue(value) {
    var that = Value('symbol', value);
    that.toString = function() {
        return '/' + value;
    }
    return that;
};


function StringValue(value) {
    var that = Value('string', value);
    that.toString = function() {
        return '\'' + Array.prototype.map.call(value, function (c) {
            if (c === '\'' || c === '\\') {
                return '\\' + c;
            } else if (c === '\n') {
                return '\\n';
            } else if (c === '\r') {
                return '\\r';
            } else {
                return c;
            }
        }).join('') + '\'';
    }
    return that;
};


function IntegerValue(value) {
    if (typeof(value) === 'string') {
        value = parseInt(value, 10);
    }
    if (typeof(value) !== 'number') {
        throw new Error('Integer expects a String or a Number');
    }
    if (isNaN(value)) {
        throw new Error('integer is NaN?!?');
    }
    /* TODO: arbitrary-precision integers, currently just 32-bit */
    if (!(-0x80000000 <= value && value <= 0x7FFFFFFF)) {
        throw new Error(value + ' is too large: integers currently cannot exceed signed 32-bit range (-2³¹ ≤ z ≤ 2³¹ - 1)');
    }
    var that = Value('integer', value);
    that.compare = function(b) {
        return Math.sign(value - b.getValue());
    };
    that.add = function(b) {
        return IntegerValue(value + b.getValue());
    };
    that.sub = function(b) {
        return IntegerValue(value - b.getValue());
    };
    that.mul = function(b) {
        return IntegerValue(value * b.getValue());
    };
    that.div = function(b) {
        /* floor division*/
        return IntegerValue(Math.floor(value / b.getValue()));
    };
    that.mod = function(b) {
        b = b.getValue();
        /* remainder with the sign of the divisor */
        return IntegerValue(((value % b) + b) % b);
    };
    that.pow = function(b) {
        if (b.getValue() < 0) {
            throw new Error(b.getValue() + ' is negative');
        }
        return IntegerValue(Math.pow(value, b.getValue()));
    };
    that.sqrt = function() {
        return IntegerValue(Math.sqrt(value));
    };
    return that;
};

function BooleanValue(value) {
    if (typeof(value) === 'string') {
        if (value === 'true') {
            value = true;
        } else if (value === 'false') {
            value = false;
        } else {
            throw new Error(value + ' is not a valid boolean');
        }
    } else if (typeof(value) !== 'boolean') {
        throw new Error('BoolValue expects a String or a Boolean');
    }
    var that = Value('boolean', value);
    that.toString = function() {
        return value ? 'true' : 'false';
    }
    that.not = function () {
        return BooleanValue(!value);
    };
    that.and = function (b) {
        return BooleanValue(value && b.getValue());
    };
    that.or = function (b) {
        return BooleanValue(value || b.getValue());
    };
    that.xor = function (b) {
        return BooleanValue(!!(+value ^ +b.getValue()));
    };
    return that;
};


var UserFunction = function UserFunctionValue(value) {
    var that = Value('function', value);
    that.toString = function() {
        return '[' + value.map(function(v) {
            return v.getSource();
        }).join(' ') + ']';
    };
    that.invoke = function(stack, scope) {
        execute(value, stack, scope);
    };
    return that;
};



var InternalFunction = function InternalFunctionValue(callback, name) {
    if (typeof(callback) !== 'function') {
        throw new Error('Internal functions expect a callback');
    }
    if (name === undefined) {
        throw new Error('Internal functions need a name');
    }
    var that = Value('function', name);
    that.toString = function() {
        return name;
    };
    that.invoke = function(stack, scope) {
        callback(stack, scope);
    };
    return that;
};



var ObjectValue = function(name) {
    if (name === undefined) {
        throw new Error('Objects need a name');
    }
    var that = Value('object', name);
    that.toString = function() {
        return name;
    };
    that.data = {};
    return that;
}



module.exports = {
    string: StringValue,
    integer: IntegerValue,
    'user-function': UserFunction,
    'internal-function': InternalFunction,
    symbol: SymbolValue,
    boolean: BooleanValue,
    object: ObjectValue
};