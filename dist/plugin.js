"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
    function Plugin(parent) {
        _classCallCheck(this, Plugin);

        this.parent = parent;
        this.paused = false;
    }

    /**
     * handler for pointerdown PIXI event
     * @param {PIXI.interaction.InteractionEvent} event
     */


    _createClass(Plugin, [{
        key: "down",
        value: function down(event) {}

        /**
         * handler for pointermove PIXI event
         * @param {PIXI.interaction.InteractionEvent} event
         */

    }, {
        key: "move",
        value: function move(event) {}

        /**
         * handler for pointerup PIXI event
         * @param {PIXI.interaction.InteractionEvent} event
         */

    }, {
        key: "up",
        value: function up(event) {}

        /**
         * handler for wheel event on div
         * @param {WheelEvent} event
         */

    }, {
        key: "wheel",
        value: function wheel(event) {}

        /**
         * called on each tick
         */

    }, {
        key: "update",
        value: function update() {}

        /**
         * called when the viewport is resized
         */

    }, {
        key: "resize",
        value: function resize() {}

        /**
         * called when the viewport is manually moved
         */

    }, {
        key: "reset",
        value: function reset() {}

        /**
         * called when viewport is paused
         */

    }, {
        key: "pause",
        value: function pause() {
            this.paused = true;
        }

        /**
         * called when viewport is resumed
         */

    }, {
        key: "resume",
        value: function resume() {
            this.paused = false;
        }
    }]);

    return Plugin;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wbHVnaW4uanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsInBhdXNlZCIsImV2ZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQUEsT0FBT0MsT0FBUDtBQUVJLG9CQUFZQyxNQUFaLEVBQ0E7QUFBQTs7QUFDSSxhQUFLQSxNQUFMLEdBQWNBLE1BQWQ7QUFDQSxhQUFLQyxNQUFMLEdBQWMsS0FBZDtBQUNIOztBQUVEOzs7Ozs7QUFSSjtBQUFBO0FBQUEsNkJBWVNDLEtBWlQsRUFZZ0IsQ0FBRzs7QUFFZjs7Ozs7QUFkSjtBQUFBO0FBQUEsNkJBa0JTQSxLQWxCVCxFQWtCZ0IsQ0FBRzs7QUFFZjs7Ozs7QUFwQko7QUFBQTtBQUFBLDJCQXdCT0EsS0F4QlAsRUF3QmMsQ0FBRzs7QUFFYjs7Ozs7QUExQko7QUFBQTtBQUFBLDhCQThCVUEsS0E5QlYsRUE4QmlCLENBQUc7O0FBRWhCOzs7O0FBaENKO0FBQUE7QUFBQSxpQ0FtQ2EsQ0FBRzs7QUFFWjs7OztBQXJDSjtBQUFBO0FBQUEsaUNBd0NhLENBQUc7O0FBRVo7Ozs7QUExQ0o7QUFBQTtBQUFBLGdDQTZDWSxDQUFHOztBQUVYOzs7O0FBL0NKO0FBQUE7QUFBQSxnQ0FtREk7QUFDSSxpQkFBS0QsTUFBTCxHQUFjLElBQWQ7QUFDSDs7QUFFRDs7OztBQXZESjtBQUFBO0FBQUEsaUNBMkRJO0FBQ0ksaUJBQUtBLE1BQUwsR0FBYyxLQUFkO0FBQ0g7QUE3REw7O0FBQUE7QUFBQSIsImZpbGUiOiJwbHVnaW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFBsdWdpblxyXG57XHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnRcclxuICAgICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGVyIGZvciBwb2ludGVyZG93biBQSVhJIGV2ZW50XHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuaW50ZXJhY3Rpb24uSW50ZXJhY3Rpb25FdmVudH0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgZG93bihldmVudCkgeyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGVyIGZvciBwb2ludGVybW92ZSBQSVhJIGV2ZW50XHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuaW50ZXJhY3Rpb24uSW50ZXJhY3Rpb25FdmVudH0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgbW92ZShldmVudCkgeyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGVyIGZvciBwb2ludGVydXAgUElYSSBldmVudFxyXG4gICAgICogQHBhcmFtIHtQSVhJLmludGVyYWN0aW9uLkludGVyYWN0aW9uRXZlbnR9IGV2ZW50XHJcbiAgICAgKi9cclxuICAgIHVwKGV2ZW50KSB7IH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZXIgZm9yIHdoZWVsIGV2ZW50IG9uIGRpdlxyXG4gICAgICogQHBhcmFtIHtXaGVlbEV2ZW50fSBldmVudFxyXG4gICAgICovXHJcbiAgICB3aGVlbChldmVudCkgeyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjYWxsZWQgb24gZWFjaCB0aWNrXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZSgpIHsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2FsbGVkIHdoZW4gdGhlIHZpZXdwb3J0IGlzIHJlc2l6ZWRcclxuICAgICAqL1xyXG4gICAgcmVzaXplKCkgeyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjYWxsZWQgd2hlbiB0aGUgdmlld3BvcnQgaXMgbWFudWFsbHkgbW92ZWRcclxuICAgICAqL1xyXG4gICAgcmVzZXQoKSB7IH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNhbGxlZCB3aGVuIHZpZXdwb3J0IGlzIHBhdXNlZFxyXG4gICAgICovXHJcbiAgICBwYXVzZSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wYXVzZWQgPSB0cnVlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjYWxsZWQgd2hlbiB2aWV3cG9ydCBpcyByZXN1bWVkXHJcbiAgICAgKi9cclxuICAgIHJlc3VtZSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZVxyXG4gICAgfVxyXG59Il19