'use strict';

var Penner = require('penner');

function exists(a) {
    return a !== undefined && a !== null;
}

function defaults(a, defaults) {
    return a !== undefined && a !== null ? a : defaults;
}

/**
 * @param {(function|string)} [ease]
 * @param {string} defaults for pennr equation
 * @private
 * @returns {function} correct penner equation
 */
function ease(ease, defaults) {
    if (!exists(ease)) {
        return Penner[defaults];
    } else if (typeof ease === 'function') {
        return ease;
    } else if (typeof ease === 'string') {
        return Penner[ease];
    }
}

module.exports = {
    exists: exists,
    defaults: defaults,
    ease: ease
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy5qcyJdLCJuYW1lcyI6WyJQZW5uZXIiLCJyZXF1aXJlIiwiZXhpc3RzIiwiYSIsInVuZGVmaW5lZCIsImRlZmF1bHRzIiwiZWFzZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxRQUFSLENBQWY7O0FBRUEsU0FBU0MsTUFBVCxDQUFnQkMsQ0FBaEIsRUFDQTtBQUNJLFdBQU9BLE1BQU1DLFNBQU4sSUFBbUJELE1BQU0sSUFBaEM7QUFDSDs7QUFFRCxTQUFTRSxRQUFULENBQWtCRixDQUFsQixFQUFxQkUsUUFBckIsRUFDQTtBQUNJLFdBQVFGLE1BQU1DLFNBQU4sSUFBbUJELE1BQU0sSUFBMUIsR0FBa0NBLENBQWxDLEdBQXNDRSxRQUE3QztBQUNIOztBQUVEOzs7Ozs7QUFNQSxTQUFTQyxJQUFULENBQWNBLElBQWQsRUFBb0JELFFBQXBCLEVBQ0E7QUFDSSxRQUFJLENBQUNILE9BQU9JLElBQVAsQ0FBTCxFQUNBO0FBQ0ksZUFBT04sT0FBT0ssUUFBUCxDQUFQO0FBQ0gsS0FIRCxNQUlLLElBQUksT0FBT0MsSUFBUCxLQUFnQixVQUFwQixFQUNMO0FBQ0ksZUFBT0EsSUFBUDtBQUNILEtBSEksTUFJQSxJQUFJLE9BQU9BLElBQVAsS0FBZ0IsUUFBcEIsRUFDTDtBQUNJLGVBQU9OLE9BQU9NLElBQVAsQ0FBUDtBQUNIO0FBQ0o7O0FBRURDLE9BQU9DLE9BQVAsR0FBaUI7QUFDYk4sa0JBRGE7QUFFYkcsc0JBRmE7QUFHYkM7QUFIYSxDQUFqQiIsImZpbGUiOiJ1dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBlbm5lciA9IHJlcXVpcmUoJ3Blbm5lcicpXG5cbmZ1bmN0aW9uIGV4aXN0cyhhKVxue1xuICAgIHJldHVybiBhICE9PSB1bmRlZmluZWQgJiYgYSAhPT0gbnVsbFxufVxuXG5mdW5jdGlvbiBkZWZhdWx0cyhhLCBkZWZhdWx0cylcbntcbiAgICByZXR1cm4gKGEgIT09IHVuZGVmaW5lZCAmJiBhICE9PSBudWxsKSA/IGEgOiBkZWZhdWx0c1xufVxuXG4vKipcbiAqIEBwYXJhbSB7KGZ1bmN0aW9ufHN0cmluZyl9IFtlYXNlXVxuICogQHBhcmFtIHtzdHJpbmd9IGRlZmF1bHRzIGZvciBwZW5uciBlcXVhdGlvblxuICogQHByaXZhdGVcbiAqIEByZXR1cm5zIHtmdW5jdGlvbn0gY29ycmVjdCBwZW5uZXIgZXF1YXRpb25cbiAqL1xuZnVuY3Rpb24gZWFzZShlYXNlLCBkZWZhdWx0cylcbntcbiAgICBpZiAoIWV4aXN0cyhlYXNlKSlcbiAgICB7XG4gICAgICAgIHJldHVybiBQZW5uZXJbZGVmYXVsdHNdXG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBlYXNlID09PSAnZnVuY3Rpb24nKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIGVhc2VcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGVhc2UgPT09ICdzdHJpbmcnKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIFBlbm5lcltlYXNlXVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZXhpc3RzLFxuICAgIGRlZmF1bHRzLFxuICAgIGVhc2Vcbn1cbiJdfQ==