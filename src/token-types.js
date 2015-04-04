var Token = function Token(name) {
    this.name = name
};

Token.prototype.toString = function() {
    return 'token:' + this.name;
};


var Literal = function LiteralToken(value) {
    this.value = value;
    Token.call(this, 'literal');
};

Literal.prototype = Object.create(Token.prototype);

Literal.prototype.toString = function() {
    return Token.prototype.toString.call(this) + '(' + this.value + ')';
};


var VariableName = function VariableNameToken(value) {
    this.value = value;
    Token.call(this, 'variable-name');
};

VariableName.prototype = Object.create(Token.prototype);

VariableName.prototype.toString = function() {
    return Token.prototype.toString.call(this) + '(' + this.value + ')';
};


var FunctionOpening = function() {
    Token.call(this, 'function-opening');
};

FunctionOpening.prototype = Object.create(Token.prototype);


var FunctionClosing = function() {
    Token.call(this, 'function-closing');
};

FunctionClosing.prototype = Object.create(Token.prototype);


var Invoke = function() {
    Token.call(this, 'invoke');
};

Invoke.prototype = Object.create(Token.prototype);


module.exports = {
    Token:           Token,
    Literal:         Literal,
    VariableName:    VariableName,
    FunctionOpening: FunctionOpening,
    FunctionClosing: FunctionClosing,
    Invoke:          Invoke
};
