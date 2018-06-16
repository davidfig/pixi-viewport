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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy5qcyJdLCJuYW1lcyI6WyJQZW5uZXIiLCJyZXF1aXJlIiwiZXhpc3RzIiwiYSIsInVuZGVmaW5lZCIsImRlZmF1bHRzIiwiZWFzZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxRQUFSLENBQWY7O0FBRUEsU0FBU0MsTUFBVCxDQUFnQkMsQ0FBaEIsRUFDQTtBQUNJLFdBQU9BLE1BQU1DLFNBQU4sSUFBbUJELE1BQU0sSUFBaEM7QUFDSDs7QUFFRCxTQUFTRSxRQUFULENBQWtCRixDQUFsQixFQUFxQkUsUUFBckIsRUFDQTtBQUNJLFdBQVFGLE1BQU1DLFNBQU4sSUFBbUJELE1BQU0sSUFBMUIsR0FBa0NBLENBQWxDLEdBQXNDRSxRQUE3QztBQUNIOztBQUVEOzs7Ozs7QUFNQSxTQUFTQyxJQUFULENBQWNBLElBQWQsRUFBb0JELFFBQXBCLEVBQ0E7QUFDSSxRQUFJLENBQUNILE9BQU9JLElBQVAsQ0FBTCxFQUNBO0FBQ0ksZUFBT04sT0FBT0ssUUFBUCxDQUFQO0FBQ0gsS0FIRCxNQUlLLElBQUksT0FBT0MsSUFBUCxLQUFnQixVQUFwQixFQUNMO0FBQ0ksZUFBT0EsSUFBUDtBQUNILEtBSEksTUFJQSxJQUFJLE9BQU9BLElBQVAsS0FBZ0IsUUFBcEIsRUFDTDtBQUNJLGVBQU9OLE9BQU9NLElBQVAsQ0FBUDtBQUNIO0FBQ0o7O0FBRURDLE9BQU9DLE9BQVAsR0FBaUI7QUFDYk4sa0JBRGE7QUFFYkcsc0JBRmE7QUFHYkM7QUFIYSxDQUFqQiIsImZpbGUiOiJ1dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBlbm5lciA9IHJlcXVpcmUoJ3Blbm5lcicpXHJcblxyXG5mdW5jdGlvbiBleGlzdHMoYSlcclxue1xyXG4gICAgcmV0dXJuIGEgIT09IHVuZGVmaW5lZCAmJiBhICE9PSBudWxsXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRzKGEsIGRlZmF1bHRzKVxyXG57XHJcbiAgICByZXR1cm4gKGEgIT09IHVuZGVmaW5lZCAmJiBhICE9PSBudWxsKSA/IGEgOiBkZWZhdWx0c1xyXG59XHJcblxyXG4vKipcclxuICogQHBhcmFtIHsoZnVuY3Rpb258c3RyaW5nKX0gW2Vhc2VdXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBkZWZhdWx0cyBmb3IgcGVubnIgZXF1YXRpb25cclxuICogQHByaXZhdGVcclxuICogQHJldHVybnMge2Z1bmN0aW9ufSBjb3JyZWN0IHBlbm5lciBlcXVhdGlvblxyXG4gKi9cclxuZnVuY3Rpb24gZWFzZShlYXNlLCBkZWZhdWx0cylcclxue1xyXG4gICAgaWYgKCFleGlzdHMoZWFzZSkpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIFBlbm5lcltkZWZhdWx0c11cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHR5cGVvZiBlYXNlID09PSAnZnVuY3Rpb24nKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBlYXNlXHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh0eXBlb2YgZWFzZSA9PT0gJ3N0cmluZycpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIFBlbm5lcltlYXNlXVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGV4aXN0cyxcclxuICAgIGRlZmF1bHRzLFxyXG4gICAgZWFzZVxyXG59XHJcbiJdfQ==