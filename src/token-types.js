var Token = function Token(name) {
    return {
        getName: function() {
            return name;
        },
        toString: function() {
            return 'token:' + name;
        }
    }
};


var Literal = function LiteralToken(value) {
    var that = Token('literal');
    that.getValue = function() {
        return value;
    }
    that.toString = function() {
        return 'token:literal(' + value + ')';
    };
    return that;
};


var VariableName = function VariableNameToken(value) {
    var that = Token('variable-name');
    that.getValue = function() {
        return value;
    }
    that.toString = function() {
        return 'token:variable-name(' + value + ')';
    };
    return that;
};


var FunctionOpening = function() {
    return Token('function-opening');
};


var FunctionClosing = function() {
    return Token('function-closing');
};


var Invoke = function() {
    return Token('invoke');
};


module.exports = {
    Literal:         Literal,
    VariableName:    VariableName,
    FunctionOpening: FunctionOpening,
    FunctionClosing: FunctionClosing,
    Invoke:          Invoke
};
