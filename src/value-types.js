var execute = require('./execute');

var Value = function Value(value) {
    this.value = value;
};

Value.prototype.equals = function(b) {
    return b instanceof this.constructor && this.value === b.value;
};

Value.prototype.toString = function() {
    return this.value;
};


var Symbol = function SymbolValue(value) {
    Value.call(this, value);
};

Symbol.prototype = Object.create(Value.prototype);

Symbol.prototype.toJSON = function() {
    return {
        type: 'value:symbol',
        value: this.value
    };
};

Symbol.prototype.toString = function() {
    return '/' + this.value;
};


var String = function StringValue(value) {
    Value.call(this, value);
};

String.prototype = Object.create(Value.prototype);

String.prototype.toString = function() {
    return '\'' + Array.prototype.map.call(this.value, function (c) {
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
};

String.prototype.toJSON = function() {
    return {
        type: 'value:string',
        value: this.value
    };
};


var Integer = function IntegerValue(value) {
    if (typeof(value) === 'string') {
        Value.call(this, parseInt(value, 10));
    } else {
        Value.call(this, value);
    }
    if (typeof(this.value) !== 'number') {
        throw new Error('Integer expects a String or a Number');
    }
    if (isNaN(this.value)) {
        throw new Error('integer is NaN?!?');
    }
    /* TODO: arbitrary-precision integers, currently just 32-bit */
    if (!(-0x80000000 <= this.value && this.value <= 0x7FFFFFFF)) {
        throw new Error(this.value + ' is too large: integers currently cannot exceed signed 32-bit range (-2³¹ ≤ z ≤ 2³¹ - 1)');
    }
};

Integer.prototype = Object.create(Value.prototype);

Integer.prototype.toJSON = function() {
    return {
        type: 'value:integer',
        value: this.value
    };
};


Integer.prototype.compare = function(b) {
    return Math.sign(this.value - b.value);
};

Integer.prototype.add = function(b) {
    return new Integer(this.value + b.value);
};

Integer.prototype.sub = function(b) {
    return new Integer(this.value - b.value);
};

Integer.prototype.mul = function(b) {
    return new Integer(this.value * b.value);
};

Integer.prototype.div = function(b) {
    /* floor division*/
    return new Integer(Math.floor(this.value / b.value));
};

Integer.prototype.mod = function(b) {
    b = b.value;
    /* remainder with the sign of the divisor */
    return new Integer(((this.value % b) + b) % b);
};


var Boolean = function BooleanValue(value) {
    if (typeof(value) === 'string') {
        if (value === 'true') {
            Value.call(this, true);
        } else if (value === 'false') {
            Value.call(this, false);
        } else {
            throw new Error(value + ' is not a valid boolean');
        }
    } else if (typeof(value) !== 'boolean') {
        throw new Error('BoolValue expects a String or a Boolean');
    } else {
        Value.call(this, value);
    }
};

Boolean.prototype = Object.create(Value.prototype);

Boolean.prototype.toJSON = function() {
    return {
        type: 'value:boolean',
        value: this.value
    };
};

Boolean.prototype.toString = function() {
    return this.value ? 'true' : 'false';
};

Boolean.prototype.not = function () {
    return new Boolean(!this.value);
};

Boolean.prototype.and = function (b) {
    return new Boolean(this.value && b.value);
};

Boolean.prototype.or = function (b) {
    return new Boolean(this.value || b.value);
};

Boolean.prototype.xor = function (b) {
    return new Boolean(!!(+this.value ^ +b.value));
};


var Function = function FunctionValue(value) {
    Value.call(this, value);
};

Function.prototype = Object.create(Value.prototype);

Function.prototype.toJSON = function() {
    return {
        type: 'value:function',
        value: this.value
    };
};

Function.prototype.invoke = function(stack, scope) {
    execute(this.value, stack, scope);
};

Function.prototype.toString = function() {
    return '[' + this.value.map(function(v) {
        return v.source;
    }).join(' ') + ']';
};


var InternalFunction = function InternalFunctionValue(callback, name) {
    if (typeof(callback) !== 'function') {
        throw new Error('Internal functions expect a callback');
    }
    if (name === undefined) {
        throw new Error('Internal functions need a name');
    }
    this.name = name;
    Value.call(this, callback);
};

InternalFunction.prototype = Object.create(Function.prototype);

InternalFunction.prototype.invoke = function(stack, scope) {
    this.value(stack, scope);
};

InternalFunction.prototype.toString = function() {
    return this.name;
};


module.exports = {
    value: Value,
    string: String,
    integer: Integer,
    function: Function,
    'internal-function': InternalFunction,
    symbol: Symbol,
    boolean: Boolean
};
