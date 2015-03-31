var valueTypes = require('./value-types');

var Opcode = function Opcode(name, source) {
    this.name = name;
    this.source = source;
};

Opcode.prototype.execute = function(stack, scope) {
    throw new Error('Unhandled opcode: ' + this);
};

Opcode.prototype.toString = function() {
    return 'opcode:' + this.name;
};


var PushValue = function PushValueOpcode(value) {
    this.value = value;
    Opcode.call(this, 'push-value', value);
};

PushValue.prototype = Object.create(Opcode.prototype);

PushValue.prototype.toString = function() {
    return Opcode.prototype.toString.call(this) + '(' + this.value + ')';
};

PushValue.prototype.execute = function(stack) {
    stack.push(this.value);
};


var PushVariable = function PushVariableOpcode(variable) {
    this.variable = variable;
    Opcode.call(this, 'push-variable', variable);
};

PushVariable.prototype = Object.create(Opcode.prototype);

PushVariable.prototype.toString = function() {
    return Opcode.prototype.toString.call(this) + '(' + this.variable + ')';
};

PushVariable.prototype.execute = function(stack, scope) {
    if (scope[this.variable] !== undefined) {
        stack.push(scope[this.variable]);
    } else {
        throw new Error('No variable named \'' + this.variable + '\'');
    }
};


var Invoke = function InvokeOpcode() {
    Opcode.call(this, 'invoke', '.');
};

Invoke.prototype = Object.create(Opcode.prototype);

Invoke.prototype.execute = function(stack, scope) {
    var func = stack.pop();
    if (func instanceof valueTypes.function) {
        func.invoke(stack, scope);
    } else {
        throw new Error('Cannot invoke value of type ' + func);
    }
};


module.exports = {
    Opcode:       Opcode,
    PushValue:    PushValue,
    PushVariable: PushVariable,
    Invoke:       Invoke
};
