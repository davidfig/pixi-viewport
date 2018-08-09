'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var utils = require('./utils');
var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(Drag, _Plugin);

    /**
     * enable one-finger touch to drag
     * @private
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {string} [options.direction=all] direction to drag (all, x, or y)
     * @param {boolean} [options.wheel=true] use wheel to scroll in y direction (unless wheel plugin is active)
     * @param {number} [options.wheelScroll=1] number of pixels to scroll with each wheel spin
     * @param {boolean} [options.reverse] reverse the direction of the wheel scroll
     * @param {boolean|string} [options.clampWheel] (true, x, or y) clamp wheel (to avoid weird bounce with mouse wheel)
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
     */
    function Drag(parent, options) {
        _classCallCheck(this, Drag);

        options = options || {};

        var _this = _possibleConstructorReturn(this, (Drag.__proto__ || Object.getPrototypeOf(Drag)).call(this, parent));

        _this.moved = false;
        _this.wheelActive = utils.defaults(options.wheel, true);
        _this.wheelScroll = options.wheelScroll || 1;
        _this.reverse = options.reverse ? 1 : -1;
        _this.clampWheel = options.clampWheel;
        _this.xDirection = !options.direction || options.direction === 'all' || options.direction === 'x';
        _this.yDirection = !options.direction || options.direction === 'all' || options.direction === 'y';
        _this.parseUnderflow(options.underflow || 'center');
        return _this;
    }

    _createClass(Drag, [{
        key: 'parseUnderflow',
        value: function parseUnderflow(clamp) {
            clamp = clamp.toLowerCase();
            if (clamp === 'center') {
                this.underflowX = 0;
                this.underflowY = 0;
            } else {
                this.underflowX = clamp.indexOf('left') !== -1 ? -1 : clamp.indexOf('right') !== -1 ? 1 : 0;
                this.underflowY = clamp.indexOf('top') !== -1 ? -1 : clamp.indexOf('bottom') !== -1 ? 1 : 0;
            }
        }
    }, {
        key: 'down',
        value: function down(e) {
            if (this.paused) {
                return;
            }
            var count = this.parent.countDownPointers();
            if ((count === 1 || count > 1 && !this.parent.plugins['pinch']) && this.parent.parent) {
                var parent = this.parent.parent.toLocal(e.data.global);
                this.last = { x: e.data.global.x, y: e.data.global.y, parent: parent };
                this.current = e.data.pointerId;
            } else {
                this.last = null;
            }
        }
    }, {
        key: 'move',
        value: function move(e) {
            if (this.paused) {
                return;
            }
            if (this.last && this.current === e.data.pointerId) {
                var x = e.data.global.x;
                var y = e.data.global.y;
                var count = this.parent.countDownPointers();
                if (count === 1 || count > 1 && !this.parent.plugins['pinch']) {
                    var distX = x - this.last.x;
                    var distY = y - this.last.y;
                    if (this.moved || this.xDirection && this.parent.checkThreshold(distX) || this.yDirection && this.parent.checkThreshold(distY)) {
                        var newParent = this.parent.parent.toLocal(e.data.global);
                        if (this.xDirection) {
                            this.parent.x += newParent.x - this.last.parent.x;
                        }
                        if (this.yDirection) {
                            this.parent.y += newParent.y - this.last.parent.y;
                        }
                        this.last = { x: x, y: y, parent: newParent };
                        if (!this.moved) {
                            this.parent.emit('drag-start', { screen: this.last, world: this.parent.toWorld(this.last), viewport: this.parent });
                        }
                        this.moved = true;
                        this.parent.dirty = true;
                        this.parent.emit('moved', { viewport: this.parent, type: 'drag' });
                    }
                } else {
                    this.moved = false;
                }
            }
        }
    }, {
        key: 'up',
        value: function up() {
            var touches = this.parent.getTouchPointers();
            if (touches.length === 1) {
                var pointer = touches[0];
                if (pointer.last) {
                    var parent = this.parent.parent.toLocal(pointer.last);
                    this.last = { x: pointer.last.x, y: pointer.last.y, parent: parent };
                    this.current = pointer.last.data.pointerId;
                }
                this.moved = false;
            } else if (this.last) {
                if (this.moved) {
                    this.parent.emit('drag-end', { screen: this.last, world: this.parent.toWorld(this.last), viewport: this.parent });
                    this.last = this.moved = false;
                }
            }
        }
    }, {
        key: 'wheel',
        value: function wheel(e) {
            if (this.paused) {
                return;
            }

            if (this.wheelActive) {
                var wheel = this.parent.plugins['wheel'];
                if (!wheel) {
                    this.parent.x += e.deltaX * this.wheelScroll * this.reverse;
                    this.parent.y += e.deltaY * this.wheelScroll * this.reverse;
                    if (this.clampWheel) {
                        this.clamp();
                    }
                    this.parent.emit('wheel-scroll', this.parent);
                    this.parent.emit('moved', this.parent);
                    this.parent.dirty = true;
                    e.preventDefault();
                    return true;
                }
            }
        }
    }, {
        key: 'resume',
        value: function resume() {
            this.last = null;
            this.paused = false;
        }
    }, {
        key: 'clamp',
        value: function clamp() {
            var decelerate = this.parent.plugins['decelerate'] || {};
            if (this.clampWheel !== 'y') {
                if (this.parent.screenWorldWidth < this.parent.screenWidth) {
                    switch (this.underflowX) {
                        case -1:
                            this.parent.x = 0;
                            break;
                        case 1:
                            this.parent.x = this.parent.screenWidth - this.parent.screenWorldWidth;
                            break;
                        default:
                            this.parent.x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2;
                    }
                } else {
                    if (this.parent.left < 0) {
                        this.parent.x = 0;
                        decelerate.x = 0;
                    } else if (this.parent.right > this.parent.worldWidth) {
                        this.parent.x = -this.parent.worldWidth * this.parent.scale.x + this.parent.screenWidth;
                        decelerate.x = 0;
                    }
                }
            }
            if (this.clampWheel !== 'x') {
                if (this.parent.screenWorldHeight < this.parent.screenHeight) {
                    switch (this.underflowY) {
                        case -1:
                            this.parent.y = 0;
                            break;
                        case 1:
                            this.parent.y = this.parent.screenHeight - this.parent.screenWorldHeight;
                            break;
                        default:
                            this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2;
                    }
                } else {
                    if (this.parent.top < 0) {
                        this.parent.y = 0;
                        decelerate.y = 0;
                    }
                    if (this.parent.bottom > this.parent.worldHeight) {
                        this.parent.y = -this.parent.worldHeight * this.parent.scale.y + this.parent.screenHeight;
                        decelerate.y = 0;
                    }
                }
            }
        }
    }, {
        key: 'active',
        get: function get() {
            return this.moved;
        }
    }]);

    return Drag;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kcmFnLmpzIl0sIm5hbWVzIjpbInV0aWxzIiwicmVxdWlyZSIsIlBsdWdpbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXJlbnQiLCJvcHRpb25zIiwibW92ZWQiLCJ3aGVlbEFjdGl2ZSIsImRlZmF1bHRzIiwid2hlZWwiLCJ3aGVlbFNjcm9sbCIsInJldmVyc2UiLCJjbGFtcFdoZWVsIiwieERpcmVjdGlvbiIsImRpcmVjdGlvbiIsInlEaXJlY3Rpb24iLCJwYXJzZVVuZGVyZmxvdyIsInVuZGVyZmxvdyIsImNsYW1wIiwidG9Mb3dlckNhc2UiLCJ1bmRlcmZsb3dYIiwidW5kZXJmbG93WSIsImluZGV4T2YiLCJlIiwicGF1c2VkIiwiY291bnQiLCJjb3VudERvd25Qb2ludGVycyIsInBsdWdpbnMiLCJ0b0xvY2FsIiwiZGF0YSIsImdsb2JhbCIsImxhc3QiLCJ4IiwieSIsImN1cnJlbnQiLCJwb2ludGVySWQiLCJkaXN0WCIsImRpc3RZIiwiY2hlY2tUaHJlc2hvbGQiLCJuZXdQYXJlbnQiLCJlbWl0Iiwic2NyZWVuIiwid29ybGQiLCJ0b1dvcmxkIiwidmlld3BvcnQiLCJkaXJ0eSIsInR5cGUiLCJ0b3VjaGVzIiwiZ2V0VG91Y2hQb2ludGVycyIsImxlbmd0aCIsInBvaW50ZXIiLCJkZWx0YVgiLCJkZWx0YVkiLCJwcmV2ZW50RGVmYXVsdCIsImRlY2VsZXJhdGUiLCJzY3JlZW5Xb3JsZFdpZHRoIiwic2NyZWVuV2lkdGgiLCJsZWZ0IiwicmlnaHQiLCJ3b3JsZFdpZHRoIiwic2NhbGUiLCJzY3JlZW5Xb3JsZEhlaWdodCIsInNjcmVlbkhlaWdodCIsInRvcCIsImJvdHRvbSIsIndvcmxkSGVpZ2h0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsUUFBU0MsUUFBUSxTQUFSLENBQWY7QUFDQSxJQUFNQyxTQUFTRCxRQUFRLFVBQVIsQ0FBZjs7QUFFQUUsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7Ozs7Ozs7QUFZQSxr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QUFDSjtBQUNKO0FBdE9MO0FBQUE7QUFBQSw0QkErREk7QUFDSSxtQkFBTyxLQUFLM0IsS0FBWjtBQUNIO0FBakVMOztBQUFBO0FBQUEsRUFBb0NMLE1BQXBDIiwiZmlsZSI6ImRyYWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB1dGlscyA9ICByZXF1aXJlKCcuL3V0aWxzJylcclxuY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBEcmFnIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlIG9uZS1maW5nZXIgdG91Y2ggdG8gZHJhZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRpcmVjdGlvbj1hbGxdIGRpcmVjdGlvbiB0byBkcmFnIChhbGwsIHgsIG9yIHkpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLndoZWVsPXRydWVdIHVzZSB3aGVlbCB0byBzY3JvbGwgaW4geSBkaXJlY3Rpb24gKHVubGVzcyB3aGVlbCBwbHVnaW4gaXMgYWN0aXZlKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndoZWVsU2Nyb2xsPTFdIG51bWJlciBvZiBwaXhlbHMgdG8gc2Nyb2xsIHdpdGggZWFjaCB3aGVlbCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgd2hlZWwgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW58c3RyaW5nfSBbb3B0aW9ucy5jbGFtcFdoZWVsXSAodHJ1ZSwgeCwgb3IgeSkgY2xhbXAgd2hlZWwgKHRvIGF2b2lkIHdlaXJkIGJvdW5jZSB3aXRoIG1vdXNlIHdoZWVsKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgIHRoaXMud2hlZWxBY3RpdmUgPSB1dGlscy5kZWZhdWx0cyhvcHRpb25zLndoZWVsLCB0cnVlKVxyXG4gICAgICAgIHRoaXMud2hlZWxTY3JvbGwgPSBvcHRpb25zLndoZWVsU2Nyb2xsIHx8IDFcclxuICAgICAgICB0aGlzLnJldmVyc2UgPSBvcHRpb25zLnJldmVyc2UgPyAxIDogLTFcclxuICAgICAgICB0aGlzLmNsYW1wV2hlZWwgPSBvcHRpb25zLmNsYW1wV2hlZWxcclxuICAgICAgICB0aGlzLnhEaXJlY3Rpb24gPSAhb3B0aW9ucy5kaXJlY3Rpb24gfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneCdcclxuICAgICAgICB0aGlzLnlEaXJlY3Rpb24gPSAhb3B0aW9ucy5kaXJlY3Rpb24gfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneSdcclxuICAgICAgICB0aGlzLnBhcnNlVW5kZXJmbG93KG9wdGlvbnMudW5kZXJmbG93IHx8ICdjZW50ZXInKVxyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlVW5kZXJmbG93KGNsYW1wKVxyXG4gICAge1xyXG4gICAgICAgIGNsYW1wID0gY2xhbXAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIGlmIChjbGFtcCA9PT0gJ2NlbnRlcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAwXHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WSA9IDBcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gKGNsYW1wLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZigncmlnaHQnKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gKGNsYW1wLmluZGV4T2YoJ3RvcCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdib3R0b20nKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG93bihlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBjb3VudCA9IHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKClcclxuICAgICAgICBpZiAoKGNvdW50ID09PSAxIHx8IChjb3VudCA+IDEgJiYgIXRoaXMucGFyZW50LnBsdWdpbnNbJ3BpbmNoJ10pKSAmJiB0aGlzLnBhcmVudC5wYXJlbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLnBhcmVudC5wYXJlbnQudG9Mb2NhbChlLmRhdGEuZ2xvYmFsKVxyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IGUuZGF0YS5nbG9iYWwueCwgeTogZS5kYXRhLmdsb2JhbC55LCBwYXJlbnQgfVxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBlLmRhdGEucG9pbnRlcklkXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGFjdGl2ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW92ZWRcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmxhc3QgJiYgdGhpcy5jdXJyZW50ID09PSBlLmRhdGEucG9pbnRlcklkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgeCA9IGUuZGF0YS5nbG9iYWwueFxyXG4gICAgICAgICAgICBjb25zdCB5ID0gZS5kYXRhLmdsb2JhbC55XHJcbiAgICAgICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKVxyXG4gICAgICAgICAgICBpZiAoY291bnQgPT09IDEgfHwgKGNvdW50ID4gMSAmJiAhdGhpcy5wYXJlbnQucGx1Z2luc1sncGluY2gnXSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RYID0geCAtIHRoaXMubGFzdC54XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkaXN0WSA9IHkgLSB0aGlzLmxhc3QueVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubW92ZWQgfHwgKCh0aGlzLnhEaXJlY3Rpb24gJiYgdGhpcy5wYXJlbnQuY2hlY2tUaHJlc2hvbGQoZGlzdFgpKSB8fCAodGhpcy55RGlyZWN0aW9uICYmIHRoaXMucGFyZW50LmNoZWNrVGhyZXNob2xkKGRpc3RZKSkpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BhcmVudCA9IHRoaXMucGFyZW50LnBhcmVudC50b0xvY2FsKGUuZGF0YS5nbG9iYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMueERpcmVjdGlvbilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gbmV3UGFyZW50LnggLSB0aGlzLmxhc3QucGFyZW50LnhcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMueURpcmVjdGlvbilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gbmV3UGFyZW50LnkgLSB0aGlzLmxhc3QucGFyZW50LnlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0ID0geyB4LCB5LCBwYXJlbnQ6IG5ld1BhcmVudCB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLm1vdmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnZHJhZy1zdGFydCcsIHsgc2NyZWVuOiB0aGlzLmxhc3QsIHdvcmxkOiB0aGlzLnBhcmVudC50b1dvcmxkKHRoaXMubGFzdCksIHZpZXdwb3J0OiB0aGlzLnBhcmVudH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGlydHkgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnbW92ZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ2RyYWcnIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cCgpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgdG91Y2hlcyA9IHRoaXMucGFyZW50LmdldFRvdWNoUG9pbnRlcnMoKVxyXG4gICAgICAgIGlmICh0b3VjaGVzLmxlbmd0aCA9PT0gMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ZXIgPSB0b3VjaGVzWzBdXHJcbiAgICAgICAgICAgIGlmIChwb2ludGVyLmxhc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMucGFyZW50LnBhcmVudC50b0xvY2FsKHBvaW50ZXIubGFzdClcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogcG9pbnRlci5sYXN0LngsIHk6IHBvaW50ZXIubGFzdC55LCBwYXJlbnQgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gcG9pbnRlci5sYXN0LmRhdGEucG9pbnRlcklkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMubGFzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1vdmVkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdkcmFnLWVuZCcsIHtzY3JlZW46IHRoaXMubGFzdCwgd29ybGQ6IHRoaXMucGFyZW50LnRvV29ybGQodGhpcy5sYXN0KSwgdmlld3BvcnQ6IHRoaXMucGFyZW50fSlcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdCA9IHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHdoZWVsKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy53aGVlbEFjdGl2ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHdoZWVsID0gdGhpcy5wYXJlbnQucGx1Z2luc1snd2hlZWwnXVxyXG4gICAgICAgICAgICBpZiAoIXdoZWVsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ICs9IGUuZGVsdGFYICogdGhpcy53aGVlbFNjcm9sbCAqIHRoaXMucmV2ZXJzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBlLmRlbHRhWSAqIHRoaXMud2hlZWxTY3JvbGwgKiB0aGlzLnJldmVyc2VcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNsYW1wV2hlZWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGFtcCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCd3aGVlbC1zY3JvbGwnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5kaXJ0eSA9IHRydWVcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXN1bWUoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMubGFzdCA9IG51bGxcclxuICAgICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgY2xhbXAoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGRlY2VsZXJhdGUgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydkZWNlbGVyYXRlJ10gfHwge31cclxuICAgICAgICBpZiAodGhpcy5jbGFtcFdoZWVsICE9PSAneScpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCA8IHRoaXMucGFyZW50LnNjcmVlbldpZHRoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9ICh0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9ICh0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpIC8gMlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LmxlZnQgPCAwKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS54ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5wYXJlbnQucmlnaHQgPiB0aGlzLnBhcmVudC53b3JsZFdpZHRoKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAtdGhpcy5wYXJlbnQud29ybGRXaWR0aCAqIHRoaXMucGFyZW50LnNjYWxlLnggKyB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aFxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueCA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5jbGFtcFdoZWVsICE9PSAneCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQgPCB0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dZKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgLTE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAodGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpIC8gMlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnRvcCA8IDApXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IDBcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnkgPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuYm90dG9tID4gdGhpcy5wYXJlbnQud29ybGRIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IC10aGlzLnBhcmVudC53b3JsZEhlaWdodCAqIHRoaXMucGFyZW50LnNjYWxlLnkgKyB0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHRcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnkgPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=