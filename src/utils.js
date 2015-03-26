module.exports = (function () {
    'use strict';

    function checkOverflow(integer) {
        /* TODO: arbitrary-precision integers, currently just 32-bit */
        if (!(-0x80000000 <= integer && integer <= 0x7FFFFFFF)) {
            throw new Error(integer + " is too large: integers currently cannot exceed signed 32-bit range (-2³¹ ≤ z ≤ 2³¹ - 1)");
        }
    }

    return {
        checkOverflow: checkOverflow
    };
}());
