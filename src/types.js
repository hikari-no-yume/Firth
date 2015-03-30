'use strict';

var execute = require('./execute.js');

/* screw prototypes, parasitical OOP ftw!
 * thank you based Crockford
 */
function IntValue(source) {
    function checkOverflow(integer) {
        /* TODO: arbitrary-precision integers, currently just 32-bit */
        if (!(-0x80000000 <= integer && integer <= 0x7FFFFFFF)) {
            throw new Error(integer + " is too large: integers currently cannot exceed signed 32-bit range (-2³¹ ≤ z ≤ 2³¹ - 1)");
        }
        return integer;
    }

    var value;
    if (typeof(source) === "string") {
        value = parseInt(source, 10);
        if (isNaN(value)) {
            throw new Error("integer is NaN?!?");
        }
    } else if (typeof(source) !== "number") {
        throw new Error("IntValue expects a String or a Number");
    } else {
        value = source;
    }
    checkOverflow(value);

    var that = {
        type: "integer",
        getValue: function () {
            return value;
        },
        show: function () {
            return value.toString();
        },
        equals: function (b) {
            if (that === b) {
                return true;
            } else if (that.type == "integer") {
                return value === that.getValue();
            } else {
                return false;
            }
        },
        compare: function (b) {
            var result = value - b.getValue();
            return Math.sign(result);
        },
        add: function (b) {
            b = b.getValue();
            return IntValue(checkOverflow(value + b));
        },
        sub: function (b) {
            b = b.getValue();
            return IntValue(checkOverflow(value - b));
        },
        mul: function (b) {
            b = b.getValue();
            return IntValue(checkOverflow(value * b));
        },
        div: function (b) {
            b = b.getValue();
            /* floor division*/
            return IntValue(checkOverflow(Math.floor(value / b)));
        },
        mod: function (b) {
            b = b.getValue();
            /* remainder with the sign of the divisor */
            return IntValue(checkOverflow(((value % b) + b) % b));
        }
        /* note there's no divmod: we don't have a separate method because
         * our implementation can't optimise it into a single operation
         * so there's no point in unnecessary duplication
         */
    };

    return that;
}

function StrValue(value) {
    var that = {
        type: "string",
        show: function () {
            return "'" + Array.prototype.map.call(value, function (c) {
                if (c === "'" || c === "\\") {
                    return "\\" + c;
                } else if (c === "\n") {
                    return "\\n";
                } else if (c === "\r") {
                    return "\\r";
                } else {
                    return c;
                }
            }).join('') + "'";
        },
        equals: function (b) {
            if (that === b) {
                return true;
            } else if (that.type == "string") {
                return value === that.getValue();
            } else {
                return false;
            }
        }
    };

    return that;
}

function BoolValue(source) {
    var value;
    if (typeof(source) === "string") {
        if (source === "true") {
            value = true;
        } else if (source === "false") {
            value = false;
        } else {
            throw new Error(source + " is not a valid boolean");
        }
    } else if (typeof(source) !== "boolean") {
        throw new Error("BoolValue expects a String or a Boolean");
    } else {
        value = source;
    }

    var that = {
        type: "boolean",
        getValue: function () {
            return value;
        },
        show: function () {
            return value ? "true" : "false";
        },
        equals: function (b) {
            if (that === b) {
                return true;
            } else if (that.type == "boolean") {
                return value === that.getValue();
            } else {
                return false;
            }
        },
        not: function () {
            return BoolValue(!value);
        },
        and: function (b) {
            b = b.getValue();
            return BoolValue(value && b);
        },
        or: function (b) {
            b = b.getValue();
            return BoolValue(value || b);
        },
        xor: function (b) {
            b = b.getValue();
            return BoolValue(!!(+value ^ +b));
        }
    };

    return that;
}

function SymbolValue(source) {
    var value = source;

    var that = {
        type: "symbol",
        getName: function () {
            return value;
        },
        show: function () {
            return "/" + value;
        }
    };

    return that;
}

function FuncValue(source, name) {
    var invoke;

    if (typeof(source) === "function") {
        if (name === undefined) {
            throw new Error("Internal functions need a name");
        }
        invoke = source;
    } else if (typeof(source) !== "object" && !(source instanceof Array)) {
        throw new Error("FuncValue expects a function or an AST array");
    } else {
        invoke = function (stack, scope) {
            execute(source, stack, scope);
        };
    }

    var that = {
        type: "function",
        getValue: function () {
            return value;
        },
        show: function () {
            if (typeof(source) === "function") {
                return name;
            } else {
                return "[" + source.map(function(opcode) {
                    if ("show" in opcode) {
                        return opcode.show();
                    }
                    if ("name" in opcode) {
                        return opcode.name;
                    }
                    if (opcode.type === "invoke") {
                        return ".";
                    }
                    return opcode.type
                }).join(" ") + "]";
            }
        },
        invoke: invoke
    };

    return that;
}

module.exports = {
    IntValue: IntValue,
    StrValue: StrValue,
    BoolValue: BoolValue,
    SymbolValue: SymbolValue,
    FuncValue: FuncValue
};
