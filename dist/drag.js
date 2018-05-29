'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var exists = require('exists');

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
        _this.wheelActive = exists(options.wheel) ? options.wheel : true;
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
            if (this.last) {
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
                        this.parent.emit('moved', this.parent);
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
            var oob = this.parent.OOB();
            var point = oob.cornerPoint;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kcmFnLmpzIl0sIm5hbWVzIjpbImV4aXN0cyIsInJlcXVpcmUiLCJQbHVnaW4iLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsIm1vdmVkIiwid2hlZWxBY3RpdmUiLCJ3aGVlbCIsIndoZWVsU2Nyb2xsIiwicmV2ZXJzZSIsImNsYW1wV2hlZWwiLCJ4RGlyZWN0aW9uIiwiZGlyZWN0aW9uIiwieURpcmVjdGlvbiIsInBhcnNlVW5kZXJmbG93IiwidW5kZXJmbG93IiwiY2xhbXAiLCJ0b0xvd2VyQ2FzZSIsInVuZGVyZmxvd1giLCJ1bmRlcmZsb3dZIiwiaW5kZXhPZiIsImUiLCJwYXVzZWQiLCJjb3VudCIsImNvdW50RG93blBvaW50ZXJzIiwicGx1Z2lucyIsInRvTG9jYWwiLCJkYXRhIiwiZ2xvYmFsIiwibGFzdCIsIngiLCJ5IiwiZGlzdFgiLCJkaXN0WSIsImNoZWNrVGhyZXNob2xkIiwibmV3UGFyZW50IiwiZW1pdCIsInNjcmVlbiIsIndvcmxkIiwidG9Xb3JsZCIsInZpZXdwb3J0IiwiZGlydHkiLCJ0b3VjaGVzIiwiZ2V0VG91Y2hQb2ludGVycyIsImxlbmd0aCIsInBvaW50ZXIiLCJkZWx0YVgiLCJkZWx0YVkiLCJwcmV2ZW50RGVmYXVsdCIsIm9vYiIsIk9PQiIsInBvaW50IiwiY29ybmVyUG9pbnQiLCJkZWNlbGVyYXRlIiwic2NyZWVuV29ybGRXaWR0aCIsInNjcmVlbldpZHRoIiwibGVmdCIsInJpZ2h0Iiwid29ybGRXaWR0aCIsInNjYWxlIiwic2NyZWVuV29ybGRIZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJ0b3AiLCJib3R0b20iLCJ3b3JsZEhlaWdodCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsUUFBUixDQUFmOztBQUVBLElBQU1DLFNBQVNELFFBQVEsVUFBUixDQUFmO0FBQ0FFLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7Ozs7O0FBWUEsa0JBQVlD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bnQiOlsiY29uc3QgZXhpc3RzID0gcmVxdWlyZSgnZXhpc3RzJylcclxuXHJcbmNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBEcmFnIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlIG9uZS1maW5nZXIgdG91Y2ggdG8gZHJhZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRpcmVjdGlvbj1hbGxdIGRpcmVjdGlvbiB0byBkcmFnIChhbGwsIHgsIG9yIHkpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLndoZWVsPXRydWVdIHVzZSB3aGVlbCB0byBzY3JvbGwgaW4geSBkaXJlY3Rpb24gKHVubGVzcyB3aGVlbCBwbHVnaW4gaXMgYWN0aXZlKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndoZWVsU2Nyb2xsPTFdIG51bWJlciBvZiBwaXhlbHMgdG8gc2Nyb2xsIHdpdGggZWFjaCB3aGVlbCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgd2hlZWwgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW58c3RyaW5nfSBbb3B0aW9ucy5jbGFtcFdoZWVsXSAodHJ1ZSwgeCwgb3IgeSkgY2xhbXAgd2hlZWwgKHRvIGF2b2lkIHdlaXJkIGJvdW5jZSB3aXRoIG1vdXNlIHdoZWVsKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgIHRoaXMud2hlZWxBY3RpdmUgPSBleGlzdHMob3B0aW9ucy53aGVlbCkgPyBvcHRpb25zLndoZWVsIDogdHJ1ZVxyXG4gICAgICAgIHRoaXMud2hlZWxTY3JvbGwgPSBvcHRpb25zLndoZWVsU2Nyb2xsIHx8IDFcclxuICAgICAgICB0aGlzLnJldmVyc2UgPSBvcHRpb25zLnJldmVyc2UgPyAxIDogLTFcclxuICAgICAgICB0aGlzLmNsYW1wV2hlZWwgPSBvcHRpb25zLmNsYW1wV2hlZWxcclxuICAgICAgICB0aGlzLnhEaXJlY3Rpb24gPSAhb3B0aW9ucy5kaXJlY3Rpb24gfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneCdcclxuICAgICAgICB0aGlzLnlEaXJlY3Rpb24gPSAhb3B0aW9ucy5kaXJlY3Rpb24gfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneSdcclxuICAgICAgICB0aGlzLnBhcnNlVW5kZXJmbG93KG9wdGlvbnMudW5kZXJmbG93IHx8ICdjZW50ZXInKVxyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlVW5kZXJmbG93KGNsYW1wKVxyXG4gICAge1xyXG4gICAgICAgIGNsYW1wID0gY2xhbXAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIGlmIChjbGFtcCA9PT0gJ2NlbnRlcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAwXHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WSA9IDBcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gKGNsYW1wLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZigncmlnaHQnKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gKGNsYW1wLmluZGV4T2YoJ3RvcCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdib3R0b20nKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG93bihlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBjb3VudCA9IHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKClcclxuICAgICAgICBpZiAoKGNvdW50ID09PSAxIHx8IChjb3VudCA+IDEgJiYgIXRoaXMucGFyZW50LnBsdWdpbnNbJ3BpbmNoJ10pKSAmJiB0aGlzLnBhcmVudC5wYXJlbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLnBhcmVudC5wYXJlbnQudG9Mb2NhbChlLmRhdGEuZ2xvYmFsKVxyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IGUuZGF0YS5nbG9iYWwueCwgeTogZS5kYXRhLmdsb2JhbC55LCBwYXJlbnQgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBhY3RpdmUoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vdmVkXHJcbiAgICB9XHJcblxyXG4gICAgbW92ZShlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5sYXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgeCA9IGUuZGF0YS5nbG9iYWwueFxyXG4gICAgICAgICAgICBjb25zdCB5ID0gZS5kYXRhLmdsb2JhbC55XHJcbiAgICAgICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKVxyXG4gICAgICAgICAgICBpZiAoY291bnQgPT09IDEgfHwgKGNvdW50ID4gMSAmJiAhdGhpcy5wYXJlbnQucGx1Z2luc1sncGluY2gnXSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RYID0geCAtIHRoaXMubGFzdC54XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkaXN0WSA9IHkgLSB0aGlzLmxhc3QueVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubW92ZWQgfHwgKCh0aGlzLnhEaXJlY3Rpb24gJiYgdGhpcy5wYXJlbnQuY2hlY2tUaHJlc2hvbGQoZGlzdFgpKSB8fCAodGhpcy55RGlyZWN0aW9uICYmIHRoaXMucGFyZW50LmNoZWNrVGhyZXNob2xkKGRpc3RZKSkpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BhcmVudCA9IHRoaXMucGFyZW50LnBhcmVudC50b0xvY2FsKGUuZGF0YS5nbG9iYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMueERpcmVjdGlvbilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gbmV3UGFyZW50LnggLSB0aGlzLmxhc3QucGFyZW50LnhcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMueURpcmVjdGlvbilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gbmV3UGFyZW50LnkgLSB0aGlzLmxhc3QucGFyZW50LnlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0ID0geyB4LCB5LCBwYXJlbnQ6IG5ld1BhcmVudCB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLm1vdmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnZHJhZy1zdGFydCcsIHsgc2NyZWVuOiB0aGlzLmxhc3QsIHdvcmxkOiB0aGlzLnBhcmVudC50b1dvcmxkKHRoaXMubGFzdCksIHZpZXdwb3J0OiB0aGlzLnBhcmVudH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGlydHkgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnbW92ZWQnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCB0b3VjaGVzID0gdGhpcy5wYXJlbnQuZ2V0VG91Y2hQb2ludGVycygpXHJcbiAgICAgICAgaWYgKHRvdWNoZXMubGVuZ3RoID09PSAxKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgcG9pbnRlciA9IHRvdWNoZXNbMF1cclxuICAgICAgICAgICAgaWYgKHBvaW50ZXIubGFzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5wYXJlbnQucGFyZW50LnRvTG9jYWwocG9pbnRlci5sYXN0KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0ID0geyB4OiBwb2ludGVyLmxhc3QueCwgeTogcG9pbnRlci5sYXN0LnksIHBhcmVudCB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMubGFzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1vdmVkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdkcmFnLWVuZCcsIHtzY3JlZW46IHRoaXMubGFzdCwgd29ybGQ6IHRoaXMucGFyZW50LnRvV29ybGQodGhpcy5sYXN0KSwgdmlld3BvcnQ6IHRoaXMucGFyZW50fSlcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdCA9IHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHdoZWVsKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy53aGVlbEFjdGl2ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHdoZWVsID0gdGhpcy5wYXJlbnQucGx1Z2luc1snd2hlZWwnXVxyXG4gICAgICAgICAgICBpZiAoIXdoZWVsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ICs9IGUuZGVsdGFYICogdGhpcy53aGVlbFNjcm9sbCAqIHRoaXMucmV2ZXJzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBlLmRlbHRhWSAqIHRoaXMud2hlZWxTY3JvbGwgKiB0aGlzLnJldmVyc2VcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNsYW1wV2hlZWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGFtcCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCd3aGVlbC1zY3JvbGwnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5kaXJ0eSA9IHRydWVcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXN1bWUoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMubGFzdCA9IG51bGxcclxuICAgICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgY2xhbXAoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IG9vYiA9IHRoaXMucGFyZW50Lk9PQigpXHJcbiAgICAgICAgY29uc3QgcG9pbnQgPSBvb2IuY29ybmVyUG9pbnRcclxuICAgICAgICBjb25zdCBkZWNlbGVyYXRlID0gdGhpcy5wYXJlbnQucGx1Z2luc1snZGVjZWxlcmF0ZSddIHx8IHt9XHJcbiAgICAgICAgaWYgKHRoaXMuY2xhbXBXaGVlbCAhPT0gJ3knKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGggPCB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1gpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKSAvIDJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5sZWZ0IDwgMClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueCA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMucGFyZW50LnJpZ2h0ID4gdGhpcy5wYXJlbnQud29ybGRXaWR0aClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gLXRoaXMucGFyZW50LndvcmxkV2lkdGggKiB0aGlzLnBhcmVudC5zY2FsZS54ICsgdGhpcy5wYXJlbnQuc2NyZWVuV2lkdGhcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnggPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuY2xhbXBXaGVlbCAhPT0gJ3gnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0IDwgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KSAvIDJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC50b3AgPCAwKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS55ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LmJvdHRvbSA+IHRoaXMucGFyZW50LndvcmxkSGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAtdGhpcy5wYXJlbnQud29ybGRIZWlnaHQgKiB0aGlzLnBhcmVudC5zY2FsZS55ICsgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS55ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19