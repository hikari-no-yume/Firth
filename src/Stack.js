module.exports = (function () {
    'use strict';

    /* our abstract stack type :D */
    function Stack() {
        var list = [];

        this.pop = function () {
            if (list.length === 0) {
                throw new Error("Stack is empty, nothing to drop!");
            }
            return list.pop();
        };

        this.push = function (value) {
            list.push(value);
        };

        this.getHeight = function () {
            return list.length;
        };

        this.peek = function (index) {
            if (index >= list.length) {
                throw new Error("Cannot index beyond bottom of stack.");
            }
            return list[list.length - 1 - index];
        };
    }

    return Stack;
}());
