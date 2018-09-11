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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kcmFnLmpzIl0sIm5hbWVzIjpbInV0aWxzIiwicmVxdWlyZSIsIlBsdWdpbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXJlbnQiLCJvcHRpb25zIiwibW92ZWQiLCJ3aGVlbEFjdGl2ZSIsImRlZmF1bHRzIiwid2hlZWwiLCJ3aGVlbFNjcm9sbCIsInJldmVyc2UiLCJjbGFtcFdoZWVsIiwieERpcmVjdGlvbiIsImRpcmVjdGlvbiIsInlEaXJlY3Rpb24iLCJwYXJzZVVuZGVyZmxvdyIsInVuZGVyZmxvdyIsImNsYW1wIiwidG9Mb3dlckNhc2UiLCJ1bmRlcmZsb3dYIiwidW5kZXJmbG93WSIsImluZGV4T2YiLCJlIiwicGF1c2VkIiwiY291bnQiLCJjb3VudERvd25Qb2ludGVycyIsInBsdWdpbnMiLCJ0b0xvY2FsIiwiZGF0YSIsImdsb2JhbCIsImxhc3QiLCJ4IiwieSIsImN1cnJlbnQiLCJwb2ludGVySWQiLCJkaXN0WCIsImRpc3RZIiwiY2hlY2tUaHJlc2hvbGQiLCJuZXdQYXJlbnQiLCJlbWl0Iiwic2NyZWVuIiwid29ybGQiLCJ0b1dvcmxkIiwidmlld3BvcnQiLCJ0eXBlIiwidG91Y2hlcyIsImdldFRvdWNoUG9pbnRlcnMiLCJsZW5ndGgiLCJwb2ludGVyIiwiZGVsdGFYIiwiZGVsdGFZIiwicHJldmVudERlZmF1bHQiLCJkZWNlbGVyYXRlIiwic2NyZWVuV29ybGRXaWR0aCIsInNjcmVlbldpZHRoIiwibGVmdCIsInJpZ2h0Iiwid29ybGRXaWR0aCIsInNjYWxlIiwic2NyZWVuV29ybGRIZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJ0b3AiLCJib3R0b20iLCJ3b3JsZEhlaWdodCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFFBQVNDLFFBQVEsU0FBUixDQUFmO0FBQ0EsSUFBTUMsU0FBU0QsUUFBUSxVQUFSLENBQWY7O0FBRUFFLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7Ozs7O0FBWUEsa0JBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFDSUEsa0JBQVVBLFdBQVcsRUFBckI7O0FBREosZ0hBRVVELE1BRlY7O0FBR0ksY0FBS0UsS0FBTCxHQUFhLEtBQWI7QUFDQSxjQUFLQyxXQUFMLEdBQW1CUixNQUFNUyxRQUFOLENBQWVILFFBQVFJLEtBQXZCLEVBQThCLElBQTlCLENBQW5CO0FBQ0EsY0FBS0MsV0FBTCxHQUFtQkwsUUFBUUssV0FBUixJQUF1QixDQUExQztBQUNBLGNBQUtDLE9BQUwsR0FBZU4sUUFBUU0sT0FBUixHQUFrQixDQUFsQixHQUFzQixDQUFDLENBQXRDO0FBQ0EsY0FBS0MsVUFBTCxHQUFrQlAsUUFBUU8sVUFBMUI7QUFDQSxjQUFLQyxVQUFMLEdBQWtCLENBQUNSLFFBQVFTLFNBQVQsSUFBc0JULFFBQVFTLFNBQVIsS0FBc0IsS0FBNUMsSUFBcURULFFBQVFTLFNBQVIsS0FBc0IsR0FBN0Y7QUFDQSxjQUFLQyxVQUFMLEdBQWtCLENBQUNWLFFBQVFTLFNBQVQsSUFBc0JULFFBQVFTLFNBQVIsS0FBc0IsS0FBNUMsSUFBcURULFFBQVFTLFNBQVIsS0FBc0IsR0FBN0Y7QUFDQSxjQUFLRSxjQUFMLENBQW9CWCxRQUFRWSxTQUFSLElBQXFCLFFBQXpDO0FBVko7QUFXQzs7QUExQkw7QUFBQTtBQUFBLHVDQTRCbUJDLEtBNUJuQixFQTZCSTtBQUNJQSxvQkFBUUEsTUFBTUMsV0FBTixFQUFSO0FBQ0EsZ0JBQUlELFVBQVUsUUFBZCxFQUNBO0FBQ0kscUJBQUtFLFVBQUwsR0FBa0IsQ0FBbEI7QUFDQSxxQkFBS0MsVUFBTCxHQUFrQixDQUFsQjtBQUNILGFBSkQsTUFNQTtBQUNJLHFCQUFLRCxVQUFMLEdBQW1CRixNQUFNSSxPQUFOLENBQWMsTUFBZCxNQUEwQixDQUFDLENBQTVCLEdBQWlDLENBQUMsQ0FBbEMsR0FBdUNKLE1BQU1JLE9BQU4sQ0FBYyxPQUFkLE1BQTJCLENBQUMsQ0FBN0IsR0FBa0MsQ0FBbEMsR0FBc0MsQ0FBOUY7QUFDQSxxQkFBS0QsVUFBTCxHQUFtQkgsTUFBTUksT0FBTixDQUFjLEtBQWQsTUFBeUIsQ0FBQyxDQUEzQixHQUFnQyxDQUFDLENBQWpDLEdBQXNDSixNQUFNSSxPQUFOLENBQWMsUUFBZCxNQUE0QixDQUFDLENBQTlCLEdBQW1DLENBQW5DLEdBQXVDLENBQTlGO0FBQ0g7QUFDSjtBQXpDTDtBQUFBO0FBQUEsNkJBMkNTQyxDQTNDVCxFQTRDSTtBQUNJLGdCQUFJLEtBQUtDLE1BQVQsRUFDQTtBQUNJO0FBQ0g7QUFDRCxnQkFBTUMsUUFBUSxLQUFLckIsTUFBTCxDQUFZc0IsaUJBQVosRUFBZDtBQUNBLGdCQUFJLENBQUNELFVBQVUsQ0FBVixJQUFnQkEsUUFBUSxDQUFSLElBQWEsQ0FBQyxLQUFLckIsTUFBTCxDQUFZdUIsT0FBWixDQUFvQixPQUFwQixDQUEvQixLQUFpRSxLQUFLdkIsTUFBTCxDQUFZQSxNQUFqRixFQUNBO0FBQ0ksb0JBQU1BLFNBQVMsS0FBS0EsTUFBTCxDQUFZQSxNQUFaLENBQW1Cd0IsT0FBbkIsQ0FBMkJMLEVBQUVNLElBQUYsQ0FBT0MsTUFBbEMsQ0FBZjtBQUNBLHFCQUFLQyxJQUFMLEdBQVksRUFBRUMsR0FBR1QsRUFBRU0sSUFBRixDQUFPQyxNQUFQLENBQWNFLENBQW5CLEVBQXNCQyxHQUFHVixFQUFFTSxJQUFGLENBQU9DLE1BQVAsQ0FBY0csQ0FBdkMsRUFBMEM3QixjQUExQyxFQUFaO0FBQ0EscUJBQUs4QixPQUFMLEdBQWVYLEVBQUVNLElBQUYsQ0FBT00sU0FBdEI7QUFDSCxhQUxELE1BT0E7QUFDSSxxQkFBS0osSUFBTCxHQUFZLElBQVo7QUFDSDtBQUNKO0FBNURMO0FBQUE7QUFBQSw2QkFtRVNSLENBbkVULEVBb0VJO0FBQ0ksZ0JBQUksS0FBS0MsTUFBVCxFQUNBO0FBQ0k7QUFDSDtBQUNELGdCQUFJLEtBQUtPLElBQUwsSUFBYSxLQUFLRyxPQUFMLEtBQWlCWCxFQUFFTSxJQUFGLENBQU9NLFNBQXpDLEVBQ0E7QUFDSSxvQkFBTUgsSUFBSVQsRUFBRU0sSUFBRixDQUFPQyxNQUFQLENBQWNFLENBQXhCO0FBQ0Esb0JBQU1DLElBQUlWLEVBQUVNLElBQUYsQ0FBT0MsTUFBUCxDQUFjRyxDQUF4QjtBQUNBLG9CQUFNUixRQUFRLEtBQUtyQixNQUFMLENBQVlzQixpQkFBWixFQUFkO0FBQ0Esb0JBQUlELFVBQVUsQ0FBVixJQUFnQkEsUUFBUSxDQUFSLElBQWEsQ0FBQyxLQUFLckIsTUFBTCxDQUFZdUIsT0FBWixDQUFvQixPQUFwQixDQUFsQyxFQUNBO0FBQ0ksd0JBQU1TLFFBQVFKLElBQUksS0FBS0QsSUFBTCxDQUFVQyxDQUE1QjtBQUNBLHdCQUFNSyxRQUFRSixJQUFJLEtBQUtGLElBQUwsQ0FBVUUsQ0FBNUI7QUFDQSx3QkFBSSxLQUFLM0IsS0FBTCxJQUFnQixLQUFLTyxVQUFMLElBQW1CLEtBQUtULE1BQUwsQ0FBWWtDLGNBQVosQ0FBMkJGLEtBQTNCLENBQXBCLElBQTJELEtBQUtyQixVQUFMLElBQW1CLEtBQUtYLE1BQUwsQ0FBWWtDLGNBQVosQ0FBMkJELEtBQTNCLENBQWpHLEVBQ0E7QUFDSSw0QkFBTUUsWUFBWSxLQUFLbkMsTUFBTCxDQUFZQSxNQUFaLENBQW1Cd0IsT0FBbkIsQ0FBMkJMLEVBQUVNLElBQUYsQ0FBT0MsTUFBbEMsQ0FBbEI7QUFDQSw0QkFBSSxLQUFLakIsVUFBVCxFQUNBO0FBQ0ksaUNBQUtULE1BQUwsQ0FBWTRCLENBQVosSUFBaUJPLFVBQVVQLENBQVYsR0FBYyxLQUFLRCxJQUFMLENBQVUzQixNQUFWLENBQWlCNEIsQ0FBaEQ7QUFDSDtBQUNELDRCQUFJLEtBQUtqQixVQUFULEVBQ0E7QUFDSSxpQ0FBS1gsTUFBTCxDQUFZNkIsQ0FBWixJQUFpQk0sVUFBVU4sQ0FBVixHQUFjLEtBQUtGLElBQUwsQ0FBVTNCLE1BQVYsQ0FBaUI2QixDQUFoRDtBQUNIO0FBQ0QsNkJBQUtGLElBQUwsR0FBWSxFQUFFQyxJQUFGLEVBQUtDLElBQUwsRUFBUTdCLFFBQVFtQyxTQUFoQixFQUFaO0FBQ0EsNEJBQUksQ0FBQyxLQUFLakMsS0FBVixFQUNBO0FBQ0ksaUNBQUtGLE1BQUwsQ0FBWW9DLElBQVosQ0FBaUIsWUFBakIsRUFBK0IsRUFBRUMsUUFBUSxLQUFLVixJQUFmLEVBQXFCVyxPQUFPLEtBQUt0QyxNQUFMLENBQVl1QyxPQUFaLENBQW9CLEtBQUtaLElBQXpCLENBQTVCLEVBQTREYSxVQUFVLEtBQUt4QyxNQUEzRSxFQUEvQjtBQUNIO0FBQ0QsNkJBQUtFLEtBQUwsR0FBYSxJQUFiO0FBQ0EsNkJBQUtGLE1BQUwsQ0FBWW9DLElBQVosQ0FBaUIsT0FBakIsRUFBMEIsRUFBRUksVUFBVSxLQUFLeEMsTUFBakIsRUFBeUJ5QyxNQUFNLE1BQS9CLEVBQTFCO0FBQ0g7QUFDSixpQkF2QkQsTUF5QkE7QUFDSSx5QkFBS3ZDLEtBQUwsR0FBYSxLQUFiO0FBQ0g7QUFDSjtBQUNKO0FBM0dMO0FBQUE7QUFBQSw2QkE4R0k7QUFDSSxnQkFBTXdDLFVBQVUsS0FBSzFDLE1BQUwsQ0FBWTJDLGdCQUFaLEVBQWhCO0FBQ0EsZ0JBQUlELFFBQVFFLE1BQVIsS0FBbUIsQ0FBdkIsRUFDQTtBQUNJLG9CQUFNQyxVQUFVSCxRQUFRLENBQVIsQ0FBaEI7QUFDQSxvQkFBSUcsUUFBUWxCLElBQVosRUFDQTtBQUNJLHdCQUFNM0IsU0FBUyxLQUFLQSxNQUFMLENBQVlBLE1BQVosQ0FBbUJ3QixPQUFuQixDQUEyQnFCLFFBQVFsQixJQUFuQyxDQUFmO0FBQ0EseUJBQUtBLElBQUwsR0FBWSxFQUFFQyxHQUFHaUIsUUFBUWxCLElBQVIsQ0FBYUMsQ0FBbEIsRUFBcUJDLEdBQUdnQixRQUFRbEIsSUFBUixDQUFhRSxDQUFyQyxFQUF3QzdCLGNBQXhDLEVBQVo7QUFDQSx5QkFBSzhCLE9BQUwsR0FBZWUsUUFBUWxCLElBQVIsQ0FBYUYsSUFBYixDQUFrQk0sU0FBakM7QUFDSDtBQUNELHFCQUFLN0IsS0FBTCxHQUFhLEtBQWI7QUFDSCxhQVZELE1BV0ssSUFBSSxLQUFLeUIsSUFBVCxFQUNMO0FBQ0ksb0JBQUksS0FBS3pCLEtBQVQsRUFDQTtBQUNJLHlCQUFLRixNQUFMLENBQVlvQyxJQUFaLENBQWlCLFVBQWpCLEVBQTZCLEVBQUNDLFFBQVEsS0FBS1YsSUFBZCxFQUFvQlcsT0FBTyxLQUFLdEMsTUFBTCxDQUFZdUMsT0FBWixDQUFvQixLQUFLWixJQUF6QixDQUEzQixFQUEyRGEsVUFBVSxLQUFLeEMsTUFBMUUsRUFBN0I7QUFDQSx5QkFBSzJCLElBQUwsR0FBWSxLQUFLekIsS0FBTCxHQUFhLEtBQXpCO0FBQ0g7QUFDSjtBQUNKO0FBbklMO0FBQUE7QUFBQSw4QkFxSVVpQixDQXJJVixFQXNJSTtBQUNJLGdCQUFJLEtBQUtDLE1BQVQsRUFDQTtBQUNJO0FBQ0g7O0FBRUQsZ0JBQUksS0FBS2pCLFdBQVQsRUFDQTtBQUNJLG9CQUFNRSxRQUFRLEtBQUtMLE1BQUwsQ0FBWXVCLE9BQVosQ0FBb0IsT0FBcEIsQ0FBZDtBQUNBLG9CQUFJLENBQUNsQixLQUFMLEVBQ0E7QUFDSSx5QkFBS0wsTUFBTCxDQUFZNEIsQ0FBWixJQUFpQlQsRUFBRTJCLE1BQUYsR0FBVyxLQUFLeEMsV0FBaEIsR0FBOEIsS0FBS0MsT0FBcEQ7QUFDQSx5QkFBS1AsTUFBTCxDQUFZNkIsQ0FBWixJQUFpQlYsRUFBRTRCLE1BQUYsR0FBVyxLQUFLekMsV0FBaEIsR0FBOEIsS0FBS0MsT0FBcEQ7QUFDQSx3QkFBSSxLQUFLQyxVQUFULEVBQ0E7QUFDSSw2QkFBS00sS0FBTDtBQUNIO0FBQ0QseUJBQUtkLE1BQUwsQ0FBWW9DLElBQVosQ0FBaUIsY0FBakIsRUFBaUMsS0FBS3BDLE1BQXRDO0FBQ0EseUJBQUtBLE1BQUwsQ0FBWW9DLElBQVosQ0FBaUIsT0FBakIsRUFBMEIsS0FBS3BDLE1BQS9CO0FBQ0FtQixzQkFBRTZCLGNBQUY7QUFDQSwyQkFBTyxJQUFQO0FBQ0g7QUFDSjtBQUNKO0FBN0pMO0FBQUE7QUFBQSxpQ0FnS0k7QUFDSSxpQkFBS3JCLElBQUwsR0FBWSxJQUFaO0FBQ0EsaUJBQUtQLE1BQUwsR0FBYyxLQUFkO0FBQ0g7QUFuS0w7QUFBQTtBQUFBLGdDQXNLSTtBQUNJLGdCQUFNNkIsYUFBYSxLQUFLakQsTUFBTCxDQUFZdUIsT0FBWixDQUFvQixZQUFwQixLQUFxQyxFQUF4RDtBQUNBLGdCQUFJLEtBQUtmLFVBQUwsS0FBb0IsR0FBeEIsRUFDQTtBQUNJLG9CQUFJLEtBQUtSLE1BQUwsQ0FBWWtELGdCQUFaLEdBQStCLEtBQUtsRCxNQUFMLENBQVltRCxXQUEvQyxFQUNBO0FBQ0ksNEJBQVEsS0FBS25DLFVBQWI7QUFFSSw2QkFBSyxDQUFDLENBQU47QUFDSSxpQ0FBS2hCLE1BQUwsQ0FBWTRCLENBQVosR0FBZ0IsQ0FBaEI7QUFDQTtBQUNKLDZCQUFLLENBQUw7QUFDSSxpQ0FBSzVCLE1BQUwsQ0FBWTRCLENBQVosR0FBaUIsS0FBSzVCLE1BQUwsQ0FBWW1ELFdBQVosR0FBMEIsS0FBS25ELE1BQUwsQ0FBWWtELGdCQUF2RDtBQUNBO0FBQ0o7QUFDSSxpQ0FBS2xELE1BQUwsQ0FBWTRCLENBQVosR0FBZ0IsQ0FBQyxLQUFLNUIsTUFBTCxDQUFZbUQsV0FBWixHQUEwQixLQUFLbkQsTUFBTCxDQUFZa0QsZ0JBQXZDLElBQTJELENBQTNFO0FBVFI7QUFXSCxpQkFiRCxNQWVBO0FBQ0ksd0JBQUksS0FBS2xELE1BQUwsQ0FBWW9ELElBQVosR0FBbUIsQ0FBdkIsRUFDQTtBQUNJLDZCQUFLcEQsTUFBTCxDQUFZNEIsQ0FBWixHQUFnQixDQUFoQjtBQUNBcUIsbUNBQVdyQixDQUFYLEdBQWUsQ0FBZjtBQUNILHFCQUpELE1BS0ssSUFBSSxLQUFLNUIsTUFBTCxDQUFZcUQsS0FBWixHQUFvQixLQUFLckQsTUFBTCxDQUFZc0QsVUFBcEMsRUFDTDtBQUNJLDZCQUFLdEQsTUFBTCxDQUFZNEIsQ0FBWixHQUFnQixDQUFDLEtBQUs1QixNQUFMLENBQVlzRCxVQUFiLEdBQTBCLEtBQUt0RCxNQUFMLENBQVl1RCxLQUFaLENBQWtCM0IsQ0FBNUMsR0FBZ0QsS0FBSzVCLE1BQUwsQ0FBWW1ELFdBQTVFO0FBQ0FGLG1DQUFXckIsQ0FBWCxHQUFlLENBQWY7QUFDSDtBQUNKO0FBQ0o7QUFDRCxnQkFBSSxLQUFLcEIsVUFBTCxLQUFvQixHQUF4QixFQUNBO0FBQ0ksb0JBQUksS0FBS1IsTUFBTCxDQUFZd0QsaUJBQVosR0FBZ0MsS0FBS3hELE1BQUwsQ0FBWXlELFlBQWhELEVBQ0E7QUFDSSw0QkFBUSxLQUFLeEMsVUFBYjtBQUVJLDZCQUFLLENBQUMsQ0FBTjtBQUNJLGlDQUFLakIsTUFBTCxDQUFZNkIsQ0FBWixHQUFnQixDQUFoQjtBQUNBO0FBQ0osNkJBQUssQ0FBTDtBQUNJLGlDQUFLN0IsTUFBTCxDQUFZNkIsQ0FBWixHQUFpQixLQUFLN0IsTUFBTCxDQUFZeUQsWUFBWixHQUEyQixLQUFLekQsTUFBTCxDQUFZd0QsaUJBQXhEO0FBQ0E7QUFDSjtBQUNJLGlDQUFLeEQsTUFBTCxDQUFZNkIsQ0FBWixHQUFnQixDQUFDLEtBQUs3QixNQUFMLENBQVl5RCxZQUFaLEdBQTJCLEtBQUt6RCxNQUFMLENBQVl3RCxpQkFBeEMsSUFBNkQsQ0FBN0U7QUFUUjtBQVdILGlCQWJELE1BZUE7QUFDSSx3QkFBSSxLQUFLeEQsTUFBTCxDQUFZMEQsR0FBWixHQUFrQixDQUF0QixFQUNBO0FBQ0ksNkJBQUsxRCxNQUFMLENBQVk2QixDQUFaLEdBQWdCLENBQWhCO0FBQ0FvQixtQ0FBV3BCLENBQVgsR0FBZSxDQUFmO0FBQ0g7QUFDRCx3QkFBSSxLQUFLN0IsTUFBTCxDQUFZMkQsTUFBWixHQUFxQixLQUFLM0QsTUFBTCxDQUFZNEQsV0FBckMsRUFDQTtBQUNJLDZCQUFLNUQsTUFBTCxDQUFZNkIsQ0FBWixHQUFnQixDQUFDLEtBQUs3QixNQUFMLENBQVk0RCxXQUFiLEdBQTJCLEtBQUs1RCxNQUFMLENBQVl1RCxLQUFaLENBQWtCMUIsQ0FBN0MsR0FBaUQsS0FBSzdCLE1BQUwsQ0FBWXlELFlBQTdFO0FBQ0FSLG1DQUFXcEIsQ0FBWCxHQUFlLENBQWY7QUFDSDtBQUNKO0FBQ0o7QUFDSjtBQXBPTDtBQUFBO0FBQUEsNEJBK0RJO0FBQ0ksbUJBQU8sS0FBSzNCLEtBQVo7QUFDSDtBQWpFTDs7QUFBQTtBQUFBLEVBQW9DTCxNQUFwQyIsImZpbGUiOiJkcmFnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdXRpbHMgPSAgcmVxdWlyZSgnLi91dGlscycpXHJcbmNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRHJhZyBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIGVuYWJsZSBvbmUtZmluZ2VyIHRvdWNoIHRvIGRyYWdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge1ZpZXdwb3J0fSBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kaXJlY3Rpb249YWxsXSBkaXJlY3Rpb24gdG8gZHJhZyAoYWxsLCB4LCBvciB5KVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy53aGVlbD10cnVlXSB1c2Ugd2hlZWwgdG8gc2Nyb2xsIGluIHkgZGlyZWN0aW9uICh1bmxlc3Mgd2hlZWwgcGx1Z2luIGlzIGFjdGl2ZSlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53aGVlbFNjcm9sbD0xXSBudW1iZXIgb2YgcGl4ZWxzIHRvIHNjcm9sbCB3aXRoIGVhY2ggd2hlZWwgc3BpblxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHdoZWVsIHNjcm9sbFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufHN0cmluZ30gW29wdGlvbnMuY2xhbXBXaGVlbF0gKHRydWUsIHgsIG9yIHkpIGNsYW1wIHdoZWVsICh0byBhdm9pZCB3ZWlyZCBib3VuY2Ugd2l0aCBtb3VzZSB3aGVlbClcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICB0aGlzLndoZWVsQWN0aXZlID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy53aGVlbCwgdHJ1ZSlcclxuICAgICAgICB0aGlzLndoZWVsU2Nyb2xsID0gb3B0aW9ucy53aGVlbFNjcm9sbCB8fCAxXHJcbiAgICAgICAgdGhpcy5yZXZlcnNlID0gb3B0aW9ucy5yZXZlcnNlID8gMSA6IC0xXHJcbiAgICAgICAgdGhpcy5jbGFtcFdoZWVsID0gb3B0aW9ucy5jbGFtcFdoZWVsXHJcbiAgICAgICAgdGhpcy54RGlyZWN0aW9uID0gIW9wdGlvbnMuZGlyZWN0aW9uIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAnYWxsJyB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3gnXHJcbiAgICAgICAgdGhpcy55RGlyZWN0aW9uID0gIW9wdGlvbnMuZGlyZWN0aW9uIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAnYWxsJyB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3knXHJcbiAgICAgICAgdGhpcy5wYXJzZVVuZGVyZmxvdyhvcHRpb25zLnVuZGVyZmxvdyB8fCAnY2VudGVyJylcclxuICAgIH1cclxuXHJcbiAgICBwYXJzZVVuZGVyZmxvdyhjbGFtcClcclxuICAgIHtcclxuICAgICAgICBjbGFtcCA9IGNsYW1wLnRvTG93ZXJDYXNlKClcclxuICAgICAgICBpZiAoY2xhbXAgPT09ICdjZW50ZXInKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gMFxyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1kgPSAwXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WCA9IChjbGFtcC5pbmRleE9mKCdsZWZ0JykgIT09IC0xKSA/IC0xIDogKGNsYW1wLmluZGV4T2YoJ3JpZ2h0JykgIT09IC0xKSA/IDEgOiAwXHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WSA9IChjbGFtcC5pbmRleE9mKCd0b3AnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZignYm90dG9tJykgIT09IC0xKSA/IDEgOiAwXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRvd24oZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY291bnQgPSB0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpXHJcbiAgICAgICAgaWYgKChjb3VudCA9PT0gMSB8fCAoY291bnQgPiAxICYmICF0aGlzLnBhcmVudC5wbHVnaW5zWydwaW5jaCddKSkgJiYgdGhpcy5wYXJlbnQucGFyZW50KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5wYXJlbnQucGFyZW50LnRvTG9jYWwoZS5kYXRhLmdsb2JhbClcclxuICAgICAgICAgICAgdGhpcy5sYXN0ID0geyB4OiBlLmRhdGEuZ2xvYmFsLngsIHk6IGUuZGF0YS5nbG9iYWwueSwgcGFyZW50IH1cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gZS5kYXRhLnBvaW50ZXJJZFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBhY3RpdmUoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vdmVkXHJcbiAgICB9XHJcblxyXG4gICAgbW92ZShlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5sYXN0ICYmIHRoaXMuY3VycmVudCA9PT0gZS5kYXRhLnBvaW50ZXJJZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBlLmRhdGEuZ2xvYmFsLnhcclxuICAgICAgICAgICAgY29uc3QgeSA9IGUuZGF0YS5nbG9iYWwueVxyXG4gICAgICAgICAgICBjb25zdCBjb3VudCA9IHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKClcclxuICAgICAgICAgICAgaWYgKGNvdW50ID09PSAxIHx8IChjb3VudCA+IDEgJiYgIXRoaXMucGFyZW50LnBsdWdpbnNbJ3BpbmNoJ10pKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkaXN0WCA9IHggLSB0aGlzLmxhc3QueFxyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzdFkgPSB5IC0gdGhpcy5sYXN0LnlcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vdmVkIHx8ICgodGhpcy54RGlyZWN0aW9uICYmIHRoaXMucGFyZW50LmNoZWNrVGhyZXNob2xkKGRpc3RYKSkgfHwgKHRoaXMueURpcmVjdGlvbiAmJiB0aGlzLnBhcmVudC5jaGVja1RocmVzaG9sZChkaXN0WSkpKSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdQYXJlbnQgPSB0aGlzLnBhcmVudC5wYXJlbnQudG9Mb2NhbChlLmRhdGEuZ2xvYmFsKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnhEaXJlY3Rpb24pXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ICs9IG5ld1BhcmVudC54IC0gdGhpcy5sYXN0LnBhcmVudC54XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnlEaXJlY3Rpb24pXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ICs9IG5ld1BhcmVudC55IC0gdGhpcy5sYXN0LnBhcmVudC55XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeCwgeSwgcGFyZW50OiBuZXdQYXJlbnQgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5tb3ZlZClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ2RyYWctc3RhcnQnLCB7IHNjcmVlbjogdGhpcy5sYXN0LCB3b3JsZDogdGhpcy5wYXJlbnQudG9Xb3JsZCh0aGlzLmxhc3QpLCB2aWV3cG9ydDogdGhpcy5wYXJlbnR9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgeyB2aWV3cG9ydDogdGhpcy5wYXJlbnQsIHR5cGU6ICdkcmFnJyB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXAoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHRvdWNoZXMgPSB0aGlzLnBhcmVudC5nZXRUb3VjaFBvaW50ZXJzKClcclxuICAgICAgICBpZiAodG91Y2hlcy5sZW5ndGggPT09IDEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludGVyID0gdG91Y2hlc1swXVxyXG4gICAgICAgICAgICBpZiAocG9pbnRlci5sYXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLnBhcmVudC5wYXJlbnQudG9Mb2NhbChwb2ludGVyLmxhc3QpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IHBvaW50ZXIubGFzdC54LCB5OiBwb2ludGVyLmxhc3QueSwgcGFyZW50IH1cclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IHBvaW50ZXIubGFzdC5kYXRhLnBvaW50ZXJJZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmxhc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tb3ZlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnZHJhZy1lbmQnLCB7c2NyZWVuOiB0aGlzLmxhc3QsIHdvcmxkOiB0aGlzLnBhcmVudC50b1dvcmxkKHRoaXMubGFzdCksIHZpZXdwb3J0OiB0aGlzLnBhcmVudH0pXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB3aGVlbChlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMud2hlZWxBY3RpdmUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB3aGVlbCA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ3doZWVsJ11cclxuICAgICAgICAgICAgaWYgKCF3aGVlbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBlLmRlbHRhWCAqIHRoaXMud2hlZWxTY3JvbGwgKiB0aGlzLnJldmVyc2VcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gZS5kZWx0YVkgKiB0aGlzLndoZWVsU2Nyb2xsICogdGhpcy5yZXZlcnNlXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jbGFtcFdoZWVsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xhbXAoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnd2hlZWwtc2Nyb2xsJywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc3VtZSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5sYXN0ID0gbnVsbFxyXG4gICAgICAgIHRoaXMucGF1c2VkID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBjbGFtcCgpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZGVjZWxlcmF0ZSA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2RlY2VsZXJhdGUnXSB8fCB7fVxyXG4gICAgICAgIGlmICh0aGlzLmNsYW1wV2hlZWwgIT09ICd5JylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoIDwgdGhpcy5wYXJlbnQuc2NyZWVuV2lkdGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dYKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgLTE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gKHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aClcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gKHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCkgLyAyXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQubGVmdCA8IDApXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IDBcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnggPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLnBhcmVudC5yaWdodCA+IHRoaXMucGFyZW50LndvcmxkV2lkdGgpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IC10aGlzLnBhcmVudC53b3JsZFdpZHRoICogdGhpcy5wYXJlbnQuc2NhbGUueCArIHRoaXMucGFyZW50LnNjcmVlbldpZHRoXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS54ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmNsYW1wV2hlZWwgIT09ICd4JylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCA8IHRoaXMucGFyZW50LnNjcmVlbkhlaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1kpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAodGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCkgLyAyXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQudG9wIDwgMClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueSA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5ib3R0b20gPiB0aGlzLnBhcmVudC53b3JsZEhlaWdodClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gLXRoaXMucGFyZW50LndvcmxkSGVpZ2h0ICogdGhpcy5wYXJlbnQuc2NhbGUueSArIHRoaXMucGFyZW50LnNjcmVlbkhlaWdodFxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueSA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==