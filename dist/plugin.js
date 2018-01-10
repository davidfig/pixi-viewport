"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
    function Plugin(parent) {
        _classCallCheck(this, Plugin);

        this.parent = parent;
        this.paused = false;
    }

    _createClass(Plugin, [{
        key: "down",
        value: function down() {}
    }, {
        key: "move",
        value: function move() {}
    }, {
        key: "up",
        value: function up() {}
    }, {
        key: "wheel",
        value: function wheel() {}
    }, {
        key: "update",
        value: function update() {}
    }, {
        key: "resize",
        value: function resize() {}
    }, {
        key: "reset",
        value: function reset() {}
    }, {
        key: "pause",
        value: function pause() {
            this.paused = true;
        }
    }, {
        key: "resume",
        value: function resume() {
            this.paused = false;
        }
    }]);

    return Plugin;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wbHVnaW4uanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsInBhdXNlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUFBLE9BQU9DLE9BQVA7QUFFSSxvQkFBWUMsTUFBWixFQUNBO0FBQUE7O0FBQ0ksYUFBS0EsTUFBTCxHQUFjQSxNQUFkO0FBQ0EsYUFBS0MsTUFBTCxHQUFjLEtBQWQ7QUFDSDs7QUFOTDtBQUFBO0FBQUEsK0JBUVcsQ0FBRztBQVJkO0FBQUE7QUFBQSwrQkFTVyxDQUFHO0FBVGQ7QUFBQTtBQUFBLDZCQVVTLENBQUc7QUFWWjtBQUFBO0FBQUEsZ0NBV1ksQ0FBRztBQVhmO0FBQUE7QUFBQSxpQ0FZYSxDQUFHO0FBWmhCO0FBQUE7QUFBQSxpQ0FhYSxDQUFHO0FBYmhCO0FBQUE7QUFBQSxnQ0FjWSxDQUFHO0FBZGY7QUFBQTtBQUFBLGdDQWlCSTtBQUNJLGlCQUFLQSxNQUFMLEdBQWMsSUFBZDtBQUNIO0FBbkJMO0FBQUE7QUFBQSxpQ0FzQkk7QUFDSSxpQkFBS0EsTUFBTCxHQUFjLEtBQWQ7QUFDSDtBQXhCTDs7QUFBQTtBQUFBIiwiZmlsZSI6InBsdWdpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUGx1Z2luXHJcbntcclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudFxyXG4gICAgICAgIHRoaXMucGF1c2VkID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBkb3duKCkgeyB9XHJcbiAgICBtb3ZlKCkgeyB9XHJcbiAgICB1cCgpIHsgfVxyXG4gICAgd2hlZWwoKSB7IH1cclxuICAgIHVwZGF0ZSgpIHsgfVxyXG4gICAgcmVzaXplKCkgeyB9XHJcbiAgICByZXNldCgpIHsgfVxyXG5cclxuICAgIHBhdXNlKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBhdXNlZCA9IHRydWVcclxuICAgIH1cclxuXHJcbiAgICByZXN1bWUoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGF1c2VkID0gZmFsc2VcclxuICAgIH1cclxufSJdfQ==