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

            if (this.parent.countDownPointers() <= 1) {
                this.last = { x: e.data.global.x, y: e.data.global.y };
                this.clickedAvailable = true;
            }
        }
    }, {
        key: 'move',
        value: function move(e) {
            if (this.paused) {
                return;
            }

            var x = e.data.global.x;
            var y = e.data.global.y;
            if (this.last) {
                var count = this.parent.countDownPointers();
                if (count === 1 || count > 1 && !this.parent.plugins['pinch']) {
                    var distX = x - this.last.x;
                    var distY = y - this.last.y;
                    if (this.moved || this.parent.checkThreshold(distX) || this.parent.checkThreshold(distY)) {
                        this.parent.x += distX;
                        this.parent.y += distY;
                        this.last = { x: x, y: y };
                        if (!this.moved) {
                            this.parent.emit('drag-start', { screen: this.last, world: this.parent.toWorld(this.last), viewport: this.parent });
                        }
                        this.moved = true;
                        this.parent.dirty = true;
                    }
                } else {
                    this.moved = false;
                }
            }
        }
    }, {
        key: 'up',
        value: function up(e) {
            if (this.parent.countDownPointers() === 2) {
                if (e.data.originalEvent.touches) {
                    var pointers = this.parent.trackedPointers;
                    for (var key in pointers) {
                        var pointer = pointers[key];
                        if (pointer.pointerId !== 'MOUSE' && pointer.pointerId !== e.data.pointerId) {
                            if (pointer.last) {
                                this.last = { x: pointer.last.x, y: pointer.last.y };
                            }
                        }
                    }
                    this.clickedAvailable = false;
                    this.moved = false;
                }
            } else if (this.last) {
                if (this.moved) {
                    this.parent.emit('drag-end', { screen: this.last, world: this.parent.toWorld(this.last), viewport: this.parent });
                    this.last = this.moved = false;
                } else if (this.clickedAvailable) {
                    this.parent.emit('clicked', { screen: this.last, world: this.parent.toWorld(this.last), viewport: this.parent });
                }
            }
        }
    }, {
        key: 'wheel',
        value: function wheel(dx, dy) {
            if (this.paused) {
                return;
            }

            if (this.wheelActive) {
                var wheel = this.parent.plugins['wheel'];
                if (!wheel) {
                    this.parent.x += dx * this.wheelScroll * this.reverse;
                    this.parent.y += dy * this.wheelScroll * this.reverse;
                    if (this.clampWheel) {
                        this.clamp();
                    }
                    this.parent.emit('wheel-scroll', this.parent);
                    this.parent.dirty = true;
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
                    if (oob.left) {
                        this.parent.x = 0;
                        decelerate.x = 0;
                    } else if (oob.right) {
                        this.parent.x = -point.x;
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
                    if (oob.top) {
                        this.parent.y = 0;
                        decelerate.y = 0;
                    } else if (oob.bottom) {
                        this.parent.y = -point.y;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kcmFnLmpzIl0sIm5hbWVzIjpbImV4aXN0cyIsInJlcXVpcmUiLCJQbHVnaW4iLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsIm1vdmVkIiwid2hlZWxBY3RpdmUiLCJ3aGVlbCIsIndoZWVsU2Nyb2xsIiwicmV2ZXJzZSIsImNsYW1wV2hlZWwiLCJwYXJzZVVuZGVyZmxvdyIsInVuZGVyZmxvdyIsImNsYW1wIiwidG9Mb3dlckNhc2UiLCJ1bmRlcmZsb3dYIiwidW5kZXJmbG93WSIsImluZGV4T2YiLCJlIiwicGF1c2VkIiwiY291bnREb3duUG9pbnRlcnMiLCJsYXN0IiwieCIsImRhdGEiLCJnbG9iYWwiLCJ5IiwiY2xpY2tlZEF2YWlsYWJsZSIsImNvdW50IiwicGx1Z2lucyIsImRpc3RYIiwiZGlzdFkiLCJjaGVja1RocmVzaG9sZCIsImVtaXQiLCJzY3JlZW4iLCJ3b3JsZCIsInRvV29ybGQiLCJ2aWV3cG9ydCIsImRpcnR5Iiwib3JpZ2luYWxFdmVudCIsInRvdWNoZXMiLCJwb2ludGVycyIsInRyYWNrZWRQb2ludGVycyIsImtleSIsInBvaW50ZXIiLCJwb2ludGVySWQiLCJkeCIsImR5Iiwib29iIiwiT09CIiwicG9pbnQiLCJjb3JuZXJQb2ludCIsImRlY2VsZXJhdGUiLCJzY3JlZW5Xb3JsZFdpZHRoIiwic2NyZWVuV2lkdGgiLCJsZWZ0IiwicmlnaHQiLCJzY3JlZW5Xb3JsZEhlaWdodCIsInNjcmVlbkhlaWdodCIsInRvcCIsImJvdHRvbSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsUUFBUixDQUFmOztBQUVBLElBQU1DLFNBQVNELFFBQVEsVUFBUixDQUFmO0FBQ0FFLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7Ozs7QUFXQSxrQkFBWUMsTUFBWixFQUFvQkMsT0FBcEIsRUFDQTtBQUFBOztBQUNJQSxrQkFBVUEsV0FBVyxFQUFyQjs7QUFESixnSEFFVUQs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bnQiOlsiY29uc3QgZXhpc3RzID0gcmVxdWlyZSgnZXhpc3RzJylcclxuXHJcbmNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBEcmFnIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlIG9uZS1maW5nZXIgdG91Y2ggdG8gZHJhZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy53aGVlbD10cnVlXSB1c2Ugd2hlZWwgdG8gc2Nyb2xsIGluIHkgZGlyZWN0aW9uICh1bmxlc3Mgd2hlZWwgcGx1Z2luIGlzIGFjdGl2ZSlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53aGVlbFNjcm9sbD0xXSBudW1iZXIgb2YgcGl4ZWxzIHRvIHNjcm9sbCB3aXRoIGVhY2ggd2hlZWwgc3BpblxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHdoZWVsIHNjcm9sbFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufHN0cmluZ30gW29wdGlvbnMuY2xhbXBXaGVlbF0gKHRydWUsIHgsIG9yIHkpIGNsYW1wIHdoZWVsICh0byBhdm9pZCB3ZWlyZCBib3VuY2Ugd2l0aCBtb3VzZSB3aGVlbClcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICB0aGlzLndoZWVsQWN0aXZlID0gZXhpc3RzKG9wdGlvbnMud2hlZWwpID8gb3B0aW9ucy53aGVlbCA6IHRydWVcclxuICAgICAgICB0aGlzLndoZWVsU2Nyb2xsID0gb3B0aW9ucy53aGVlbFNjcm9sbCB8fCAxXHJcbiAgICAgICAgdGhpcy5yZXZlcnNlID0gb3B0aW9ucy5yZXZlcnNlID8gMSA6IC0xXHJcbiAgICAgICAgdGhpcy5jbGFtcFdoZWVsID0gb3B0aW9ucy5jbGFtcFdoZWVsXHJcbiAgICAgICAgdGhpcy5wYXJzZVVuZGVyZmxvdyhvcHRpb25zLnVuZGVyZmxvdyB8fCAnY2VudGVyJylcclxuICAgIH1cclxuXHJcbiAgICBwYXJzZVVuZGVyZmxvdyhjbGFtcClcclxuICAgIHtcclxuICAgICAgICBjbGFtcCA9IGNsYW1wLnRvTG93ZXJDYXNlKClcclxuICAgICAgICBpZiAoY2xhbXAgPT09ICdjZW50ZXInKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gMFxyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1kgPSAwXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WCA9IChjbGFtcC5pbmRleE9mKCdsZWZ0JykgIT09IC0xKSA/IC0xIDogKGNsYW1wLmluZGV4T2YoJ3JpZ2h0JykgIT09IC0xKSA/IDEgOiAwXHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WSA9IChjbGFtcC5pbmRleE9mKCd0b3AnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZignYm90dG9tJykgIT09IC0xKSA/IDEgOiAwXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRvd24oZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpIDw9IDEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IGUuZGF0YS5nbG9iYWwueCwgeTogZS5kYXRhLmdsb2JhbC55IH1cclxuICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgYWN0aXZlKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb3ZlZFxyXG4gICAgfVxyXG5cclxuICAgIG1vdmUoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHggPSBlLmRhdGEuZ2xvYmFsLnhcclxuICAgICAgICBjb25zdCB5ID0gZS5kYXRhLmdsb2JhbC55XHJcbiAgICAgICAgaWYgKHRoaXMubGFzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKVxyXG4gICAgICAgICAgICBpZiAoY291bnQgPT09IDEgfHwgKGNvdW50ID4gMSAmJiAhdGhpcy5wYXJlbnQucGx1Z2luc1sncGluY2gnXSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RYID0geCAtIHRoaXMubGFzdC54XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkaXN0WSA9IHkgLSB0aGlzLmxhc3QueVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubW92ZWQgfHwgKHRoaXMucGFyZW50LmNoZWNrVGhyZXNob2xkKGRpc3RYKSB8fCB0aGlzLnBhcmVudC5jaGVja1RocmVzaG9sZChkaXN0WSkpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gZGlzdFhcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ICs9IGRpc3RZXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0ID0geyB4LCB5IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMubW92ZWQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdkcmFnLXN0YXJ0JywgeyBzY3JlZW46IHRoaXMubGFzdCwgd29ybGQ6IHRoaXMucGFyZW50LnRvV29ybGQodGhpcy5sYXN0KSwgdmlld3BvcnQ6IHRoaXMucGFyZW50fSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5kaXJ0eSA9IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKCkgPT09IDIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoZS5kYXRhLm9yaWdpbmFsRXZlbnQudG91Y2hlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcG9pbnRlcnMgPSB0aGlzLnBhcmVudC50cmFja2VkUG9pbnRlcnNcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBwb2ludGVycylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb2ludGVyID0gcG9pbnRlcnNba2V5XVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwb2ludGVyLnBvaW50ZXJJZCAhPT0gJ01PVVNFJyAmJiBwb2ludGVyLnBvaW50ZXJJZCAhPT0gZS5kYXRhLnBvaW50ZXJJZClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb2ludGVyLmxhc3QpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogcG9pbnRlci5sYXN0LngsIHk6IHBvaW50ZXIubGFzdC55IH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuY2xpY2tlZEF2YWlsYWJsZSA9IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmxhc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tb3ZlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnZHJhZy1lbmQnLCB7c2NyZWVuOiB0aGlzLmxhc3QsIHdvcmxkOiB0aGlzLnBhcmVudC50b1dvcmxkKHRoaXMubGFzdCksIHZpZXdwb3J0OiB0aGlzLnBhcmVudH0pXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLmNsaWNrZWRBdmFpbGFibGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ2NsaWNrZWQnLCB7IHNjcmVlbjogdGhpcy5sYXN0LCB3b3JsZDogdGhpcy5wYXJlbnQudG9Xb3JsZCh0aGlzLmxhc3QpLCB2aWV3cG9ydDogdGhpcy5wYXJlbnQgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB3aGVlbChkeCwgZHkpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy53aGVlbEFjdGl2ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHdoZWVsID0gdGhpcy5wYXJlbnQucGx1Z2luc1snd2hlZWwnXVxyXG4gICAgICAgICAgICBpZiAoIXdoZWVsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ICs9IGR4ICogdGhpcy53aGVlbFNjcm9sbCAqIHRoaXMucmV2ZXJzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBkeSAqIHRoaXMud2hlZWxTY3JvbGwgKiB0aGlzLnJldmVyc2VcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNsYW1wV2hlZWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGFtcCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCd3aGVlbC1zY3JvbGwnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmRpcnR5ID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXN1bWUoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMubGFzdCA9IG51bGxcclxuICAgICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgY2xhbXAoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IG9vYiA9IHRoaXMucGFyZW50Lk9PQigpXHJcbiAgICAgICAgY29uc3QgcG9pbnQgPSBvb2IuY29ybmVyUG9pbnRcclxuICAgICAgICBjb25zdCBkZWNlbGVyYXRlID0gdGhpcy5wYXJlbnQucGx1Z2luc1snZGVjZWxlcmF0ZSddIHx8IHt9XHJcbiAgICAgICAgaWYgKHRoaXMuY2xhbXBXaGVlbCAhPT0gJ3knKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGggPCB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1gpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKSAvIDJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChvb2IubGVmdClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueCA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9vYi5yaWdodClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gLXBvaW50LnhcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnggPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuY2xhbXBXaGVlbCAhPT0gJ3gnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0IDwgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KSAvIDJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChvb2IudG9wKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS55ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAob29iLmJvdHRvbSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gLXBvaW50LnlcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnkgPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=