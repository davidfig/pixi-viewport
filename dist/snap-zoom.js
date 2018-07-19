'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');
var utils = require('./utils');

module.exports = function (_Plugin) {
    _inherits(SnapZoom, _Plugin);

    /**
     * @private
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {number} [options.width] the desired width to snap (to maintain aspect ratio, choose only width or height)
     * @param {number} [options.height] the desired height to snap (to maintain aspect ratio, choose only width or height)
     * @param {number} [options.time=1000]
     * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {PIXI.Point} [options.center] place this point at center during zoom instead of center of the viewport
     * @param {boolean} [options.interrupt=true] pause snapping with any user input on the viewport
     * @param {boolean} [options.removeOnComplete] removes this plugin after snapping is complete
     * @param {boolean} [options.removeOnInterrupt] removes this plugin if interrupted by any user input
     * @param {boolean} [options.forceStart] starts the snap immediately regardless of whether the viewport is at the desired zoom
     * @param {boolean} [options.noMove] zoom but do not move
     *
     * @event snap-zoom-start(Viewport) emitted each time a fit animation starts
     * @event snap-zoom-end(Viewport) emitted each time fit reaches its target
     * @event snap-zoom-end(Viewport) emitted each time fit reaches its target
     */
    function SnapZoom(parent, options) {
        _classCallCheck(this, SnapZoom);

        var _this = _possibleConstructorReturn(this, (SnapZoom.__proto__ || Object.getPrototypeOf(SnapZoom)).call(this, parent));

        options = options || {};
        _this.width = options.width;
        _this.height = options.height;
        if (_this.width > 0) {
            _this.x_scale = parent._screenWidth / _this.width;
        }
        if (_this.height > 0) {
            _this.y_scale = parent._screenHeight / _this.height;
        }
        _this.xIndependent = utils.exists(_this.x_scale);
        _this.yIndependent = utils.exists(_this.y_scale);
        _this.x_scale = _this.xIndependent ? _this.x_scale : _this.y_scale;
        _this.y_scale = _this.yIndependent ? _this.y_scale : _this.x_scale;

        _this.time = utils.defaults(options.time, 1000);
        _this.ease = utils.ease(options.ease, 'easeInOutSine');
        _this.center = options.center;
        _this.noMove = options.noMove;
        _this.stopOnResize = options.stopOnResize;
        _this.removeOnInterrupt = options.removeOnInterrupt;
        _this.removeOnComplete = utils.defaults(options.removeOnComplete, true);
        _this.interrupt = utils.defaults(options.interrupt, true);
        if (_this.time === 0) {
            parent.container.scale.x = _this.x_scale;
            parent.container.scale.y = _this.y_scale;
            if (_this.removeOnComplete) {
                _this.parent.removePlugin('snap-zoom');
            }
        } else if (options.forceStart) {
            _this.createSnapping();
        }
        return _this;
    }

    _createClass(SnapZoom, [{
        key: 'createSnapping',
        value: function createSnapping() {
            var scale = this.parent.scale;
            this.snapping = { time: 0, startX: scale.x, startY: scale.y, deltaX: this.x_scale - scale.x, deltaY: this.y_scale - scale.y };
            this.parent.emit('snap-zoom-start', this.parent);
        }
    }, {
        key: 'resize',
        value: function resize() {
            this.snapping = null;

            if (this.width > 0) {
                this.x_scale = this.parent._screenWidth / this.width;
            }
            if (this.height > 0) {
                this.y_scale = this.parent._screenHeight / this.height;
            }
            this.x_scale = this.xIndependent ? this.x_scale : this.y_scale;
            this.y_scale = this.yIndependent ? this.y_scale : this.x_scale;
        }
    }, {
        key: 'reset',
        value: function reset() {
            this.snapping = null;
        }
    }, {
        key: 'wheel',
        value: function wheel() {
            if (this.removeOnInterrupt) {
                this.parent.removePlugin('snap-zoom');
            }
        }
    }, {
        key: 'down',
        value: function down() {
            if (this.removeOnInterrupt) {
                this.parent.removePlugin('snap-zoom');
            } else if (this.interrupt) {
                this.snapping = null;
            }
        }
    }, {
        key: 'update',
        value: function update(elapsed) {
            if (this.paused) {
                return;
            }
            if (this.interrupt && this.parent.countDownPointers() !== 0) {
                return;
            }

            var oldCenter = void 0;
            if (!this.center && !this.noMove) {
                oldCenter = this.parent.center;
            }
            if (!this.snapping) {
                if (this.parent.scale.x !== this.x_scale || this.parent.scale.y !== this.y_scale) {
                    this.createSnapping();
                }
            } else if (this.snapping) {
                var snapping = this.snapping;
                snapping.time += elapsed;
                if (snapping.time >= this.time) {
                    this.parent.scale.set(this.x_scale, this.y_scale);
                    if (this.removeOnComplete) {
                        this.parent.removePlugin('snap-zoom');
                    }
                    this.parent.emit('snap-zoom-end', this.parent);
                    this.snapping = null;
                } else {
                    var _snapping = this.snapping;
                    this.parent.scale.x = this.ease(_snapping.time, _snapping.startX, _snapping.deltaX, this.time);
                    this.parent.scale.y = this.ease(_snapping.time, _snapping.startY, _snapping.deltaY, this.time);
                }
                var clamp = this.parent.plugins['clamp-zoom'];
                if (clamp) {
                    clamp.clamp();
                }
                if (!this.noMove) {
                    if (!this.center) {
                        this.parent.moveCenter(oldCenter);
                    } else {
                        this.parent.moveCenter(this.center);
                    }
                }
            }
        }
    }, {
        key: 'resume',
        value: function resume() {
            this.snapping = null;
            _get(SnapZoom.prototype.__proto__ || Object.getPrototypeOf(SnapZoom.prototype), 'resume', this).call(this);
        }
    }]);

    return SnapZoom;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zbmFwLXpvb20uanMiXSwibmFtZXMiOlsiUGx1Z2luIiwicmVxdWlyZSIsInV0aWxzIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJ3aWR0aCIsImhlaWdodCIsInhfc2NhbGUiLCJfc2NyZWVuV2lkdGgiLCJ5X3NjYWxlIiwiX3NjcmVlbkhlaWdodCIsInhJbmRlcGVuZGVudCIsImV4aXN0cyIsInlJbmRlcGVuZGVudCIsInRpbWUiLCJkZWZhdWx0cyIsImVhc2UiLCJjZW50ZXIiLCJub01vdmUiLCJzdG9wT25SZXNpemUiLCJyZW1vdmVPbkludGVycnVwdCIsInJlbW92ZU9uQ29tcGxldGUiLCJpbnRlcnJ1cHQiLCJjb250YWluZXIiLCJzY2FsZSIsIngiLCJ5IiwicmVtb3ZlUGx1Z2luIiwiZm9yY2VTdGFydCIsImNyZWF0ZVNuYXBwaW5nIiwic25hcHBpbmciLCJzdGFydFgiLCJzdGFydFkiLCJkZWx0YVgiLCJkZWx0YVkiLCJlbWl0IiwiZWxhcHNlZCIsInBhdXNlZCIsImNvdW50RG93blBvaW50ZXJzIiwib2xkQ2VudGVyIiwic2V0IiwiY2xhbXAiLCJwbHVnaW5zIiwibW92ZUNlbnRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNQyxRQUFTRCxRQUFRLFNBQVIsQ0FBZjs7QUFFQUUsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBLHNCQUFZQyxNQUFaLEVBQW9CQyxPQUFwQixFQUNBO0FBQUE7O0FBQUEsd0hBQ1VELE1BRFY7O0FBRUlDLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsY0FBS0MsS0FBTCxHQUFhRCxRQUFRQyxLQUFyQjtBQUNBLGNBQUtDLE1BQUwsR0FBY0YsUUFBUUUsTUFBdEI7QUFDQSxZQUFJLE1BQUtELEtBQUwsR0FBYSxDQUFqQixFQUNBO0FBQ0ksa0JBQUtFLE9BQUwsR0FBZUosT0FBT0ssWUFBUCxHQUFzQixNQUFLSCxLQUExQztBQUNIO0FBQ0QsWUFBSSxNQUFLQyxNQUFMLEdBQWMsQ0FBbEIsRUFDQTtBQUNJLGtCQUFLRyxPQUFMLEdBQWVOLE9BQU9PLGFBQVAsR0FBdUIsTUFBS0osTUFBM0M7QUFDSDtBQUNELGNBQUtLLFlBQUwsR0FBb0JYLE1BQU1ZLE1BQU4sQ0FBYSxNQUFLTCxPQUFsQixDQUFwQjtBQUNBLGNBQUtNLFlBQUwsR0FBb0JiLE1BQU1ZLE1BQU4sQ0FBYSxNQUFLSCxPQUFsQixDQUFwQjtBQUNBLGNBQUtGLE9BQUwsR0FBZSxNQUFLSSxZQUFMLEdBQW9CLE1BQUtKLE9BQXpCLEdBQW1DLE1BQUtFLE9BQXZEO0FBQ0EsY0FBS0EsT0FBTCxHQUFlLE1BQUtJLFlBQUwsR0FBb0IsTUFBS0osT0FBekIsR0FBbUMsTUFBS0YsT0FBdkQ7O0FBRUEsY0FBS08sSUFBTCxHQUFZZCxNQUFNZSxRQUFOLENBQWVYLFFBQVFVLElBQXZCLEVBQTZCLElBQTdCLENBQVo7QUFDQSxjQUFLRSxJQUFMLEdBQVloQixNQUFNZ0IsSUFBTixDQUFXWixRQUFRWSxJQUFuQixFQUF5QixlQUF6QixDQUFaO0FBQ0EsY0FBS0MsTUFBTCxHQUFjYixRQUFRYSxNQUF0QjtBQUNBLGNBQUtDLE1BQUwsR0FBY2QsUUFBUWMsTUFBdEI7QUFDQSxjQUFLQyxZQUFMLEdBQW9CZixRQUFRZSxZQUE1QjtBQUNBLGNBQUtDLGlCQUFMLEdBQXlCaEIsUUFBUWdCLGlCQUFqQztBQUNBLGNBQUtDLGdCQUFMLEdBQXdCckIsTUFBTWUsUUFBTixDQUFlWCxRQUFRaUIsZ0JBQXZCLEVBQXlDLElBQXpDLENBQXhCO0FBQ0EsY0FBS0MsU0FBTCxHQUFpQnRCLE1BQU1lLFFBQU4sQ0FBZVgsUUFBUWtCLFNBQXZCLEVBQWtDLElBQWxDLENBQWpCO0FBQ0EsWUFBSSxNQUFLUixJQUFMLEtBQWMsQ0FBbEIsRUFDQTtBQUNJWCxtQkFBT29CLFNBQVAsQ0FBaUJDLEtBQWpCLENBQXVCQyxDQUF2QixHQUEyQixNQUFLbEIsT0FBaEM7QUFDQUosbUJBQU9vQixTQUFQLENBQWlCQyxLQUFqQixDQUF1QkUsQ0FBdkIsR0FBMkIsTUFBS2pCLE9BQWhDO0FBQ0EsZ0JBQUksTUFBS1ksZ0JBQVQsRUFDQTtBQUNJLHNCQUFLbEIsTUFBTCxDQUFZd0IsWUFBWixDQUF5QixXQUF6QjtBQUNIO0FBQ0osU0FSRCxNQVNLLElBQUl2QixRQUFRd0IsVUFBWixFQUNMO0FBQ0ksa0JBQUtDLGNBQUw7QUFDSDtBQXRDTDtBQXVDQzs7QUE3REw7QUFBQTtBQUFBLHlDQWdFSTtBQUNJLGdCQUFNTCxRQUFRLEtBQUtyQixNQUFMLENBQVlxQixLQUExQjtBQUNBLGlCQUFLTSxRQUFMLEdBQWdCLEVBQUVoQixNQUFNLENBQVIsRUFBV2lCLFFBQVFQLE1BQU1DLENBQXpCLEVBQTRCTyxRQUFRUixNQUFNRSxDQUExQyxFQUE2Q08sUUFBUSxLQUFLMUIsT0FBTCxHQUFlaUIsTUFBTUMsQ0FBMUUsRUFBNkVTLFFBQVEsS0FBS3pCLE9BQUwsR0FBZWUsTUFBTUUsQ0FBMUcsRUFBaEI7QUFDQSxpQkFBS3ZCLE1BQUwsQ0FBWWdDLElBQVosQ0FBaUIsaUJBQWpCLEVBQW9DLEtBQUtoQyxNQUF6QztBQUNIO0FBcEVMO0FBQUE7QUFBQSxpQ0F1RUk7QUFDSSxpQkFBSzJCLFFBQUwsR0FBZ0IsSUFBaEI7O0FBRUEsZ0JBQUksS0FBS3pCLEtBQUwsR0FBYSxDQUFqQixFQUNBO0FBQ0kscUJBQUtFLE9BQUwsR0FBZSxLQUFLSixNQUFMLENBQVlLLFlBQVosR0FBMkIsS0FBS0gsS0FBL0M7QUFDSDtBQUNELGdCQUFJLEtBQUtDLE1BQUwsR0FBYyxDQUFsQixFQUNBO0FBQ0kscUJBQUtHLE9BQUwsR0FBZSxLQUFLTixNQUFMLENBQVlPLGFBQVosR0FBNEIsS0FBS0osTUFBaEQ7QUFDSDtBQUNELGlCQUFLQyxPQUFMLEdBQWUsS0FBS0ksWUFBTCxHQUFvQixLQUFLSixPQUF6QixHQUFtQyxLQUFLRSxPQUF2RDtBQUNBLGlCQUFLQSxPQUFMLEdBQWUsS0FBS0ksWUFBTCxHQUFvQixLQUFLSixPQUF6QixHQUFtQyxLQUFLRixPQUF2RDtBQUNIO0FBcEZMO0FBQUE7QUFBQSxnQ0F1Rkk7QUFDSSxpQkFBS3VCLFFBQUwsR0FBZ0IsSUFBaEI7QUFDSDtBQXpGTDtBQUFBO0FBQUEsZ0NBNEZJO0FBQ0ksZ0JBQUksS0FBS1YsaUJBQVQsRUFDQTtBQUNJLHFCQUFLakIsTUFBTCxDQUFZd0IsWUFBWixDQUF5QixXQUF6QjtBQUNIO0FBQ0o7QUFqR0w7QUFBQTtBQUFBLCtCQW9HSTtBQUNJLGdCQUFJLEtBQUtQLGlCQUFULEVBQ0E7QUFDSSxxQkFBS2pCLE1BQUwsQ0FBWXdCLFlBQVosQ0FBeUIsV0FBekI7QUFDSCxhQUhELE1BSUssSUFBSSxLQUFLTCxTQUFULEVBQ0w7QUFDSSxxQkFBS1EsUUFBTCxHQUFnQixJQUFoQjtBQUNIO0FBQ0o7QUE3R0w7QUFBQTtBQUFBLCtCQStHV00sT0EvR1gsRUFnSEk7QUFDSSxnQkFBSSxLQUFLQyxNQUFULEVBQ0E7QUFDSTtBQUNIO0FBQ0QsZ0JBQUksS0FBS2YsU0FBTCxJQUFrQixLQUFLbkIsTUFBTCxDQUFZbUMsaUJBQVosT0FBb0MsQ0FBMUQsRUFDQTtBQUNJO0FBQ0g7O0FBRUQsZ0JBQUlDLGtCQUFKO0FBQ0EsZ0JBQUksQ0FBQyxLQUFLdEIsTUFBTixJQUFnQixDQUFDLEtBQUtDLE1BQTFCLEVBQ0E7QUFDSXFCLDRCQUFZLEtBQUtwQyxNQUFMLENBQVljLE1BQXhCO0FBQ0g7QUFDRCxnQkFBSSxDQUFDLEtBQUthLFFBQVYsRUFDQTtBQUNJLG9CQUFJLEtBQUszQixNQUFMLENBQVlxQixLQUFaLENBQWtCQyxDQUFsQixLQUF3QixLQUFLbEIsT0FBN0IsSUFBd0MsS0FBS0osTUFBTCxDQUFZcUIsS0FBWixDQUFrQkUsQ0FBbEIsS0FBd0IsS0FBS2pCLE9BQXpFLEVBQ0E7QUFDSSx5QkFBS29CLGNBQUw7QUFDSDtBQUNKLGFBTkQsTUFPSyxJQUFJLEtBQUtDLFFBQVQsRUFDTDtBQUNJLG9CQUFNQSxXQUFXLEtBQUtBLFFBQXRCO0FBQ0FBLHlCQUFTaEIsSUFBVCxJQUFpQnNCLE9BQWpCO0FBQ0Esb0JBQUlOLFNBQVNoQixJQUFULElBQWlCLEtBQUtBLElBQTFCLEVBQ0E7QUFDSSx5QkFBS1gsTUFBTCxDQUFZcUIsS0FBWixDQUFrQmdCLEdBQWxCLENBQXNCLEtBQUtqQyxPQUEzQixFQUFvQyxLQUFLRSxPQUF6QztBQUNBLHdCQUFJLEtBQUtZLGdCQUFULEVBQ0E7QUFDSSw2QkFBS2xCLE1BQUwsQ0FBWXdCLFlBQVosQ0FBeUIsV0FBekI7QUFDSDtBQUNELHlCQUFLeEIsTUFBTCxDQUFZZ0MsSUFBWixDQUFpQixlQUFqQixFQUFrQyxLQUFLaEMsTUFBdkM7QUFDQSx5QkFBSzJCLFFBQUwsR0FBZ0IsSUFBaEI7QUFDSCxpQkFURCxNQVdBO0FBQ0ksd0JBQU1BLFlBQVcsS0FBS0EsUUFBdEI7QUFDQSx5QkFBSzNCLE1BQUwsQ0FBWXFCLEtBQVosQ0FBa0JDLENBQWxCLEdBQXNCLEtBQUtULElBQUwsQ0FBVWMsVUFBU2hCLElBQW5CLEVBQXlCZ0IsVUFBU0MsTUFBbEMsRUFBMENELFVBQVNHLE1BQW5ELEVBQTJELEtBQUtuQixJQUFoRSxDQUF0QjtBQUNBLHlCQUFLWCxNQUFMLENBQVlxQixLQUFaLENBQWtCRSxDQUFsQixHQUFzQixLQUFLVixJQUFMLENBQVVjLFVBQVNoQixJQUFuQixFQUF5QmdCLFVBQVNFLE1BQWxDLEVBQTBDRixVQUFTSSxNQUFuRCxFQUEyRCxLQUFLcEIsSUFBaEUsQ0FBdEI7QUFDSDtBQUNELG9CQUFNMkIsUUFBUSxLQUFLdEMsTUFBTCxDQUFZdUMsT0FBWixDQUFvQixZQUFwQixDQUFkO0FBQ0Esb0JBQUlELEtBQUosRUFDQTtBQUNJQSwwQkFBTUEsS0FBTjtBQUNIO0FBQ0Qsb0JBQUksQ0FBQyxLQUFLdkIsTUFBVixFQUNBO0FBQ0ksd0JBQUksQ0FBQyxLQUFLRCxNQUFWLEVBQ0E7QUFDSSw2QkFBS2QsTUFBTCxDQUFZd0MsVUFBWixDQUF1QkosU0FBdkI7QUFDSCxxQkFIRCxNQUtBO0FBQ0ksNkJBQUtwQyxNQUFMLENBQVl3QyxVQUFaLENBQXVCLEtBQUsxQixNQUE1QjtBQUNIO0FBQ0o7QUFDSjtBQUNKO0FBM0tMO0FBQUE7QUFBQSxpQ0E4S0k7QUFDSSxpQkFBS2EsUUFBTCxHQUFnQixJQUFoQjtBQUNBO0FBQ0g7QUFqTEw7O0FBQUE7QUFBQSxFQUF3Q2hDLE1BQXhDIiwiZmlsZSI6InNuYXAtem9vbS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuY29uc3QgdXRpbHMgPSAgcmVxdWlyZSgnLi91dGlscycpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNuYXBab29tIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndpZHRoXSB0aGUgZGVzaXJlZCB3aWR0aCB0byBzbmFwICh0byBtYWludGFpbiBhc3BlY3QgcmF0aW8sIGNob29zZSBvbmx5IHdpZHRoIG9yIGhlaWdodClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5oZWlnaHRdIHRoZSBkZXNpcmVkIGhlaWdodCB0byBzbmFwICh0byBtYWludGFpbiBhc3BlY3QgcmF0aW8sIGNob29zZSBvbmx5IHdpZHRoIG9yIGhlaWdodClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aW1lPTEwMDBdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gW29wdGlvbnMuZWFzZT1lYXNlSW5PdXRTaW5lXSBlYXNlIGZ1bmN0aW9uIG9yIG5hbWUgKHNlZSBodHRwOi8vZWFzaW5ncy5uZXQvIGZvciBzdXBwb3J0ZWQgbmFtZXMpXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjZW50ZXIgb2YgdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmludGVycnVwdD10cnVlXSBwYXVzZSBzbmFwcGluZyB3aXRoIGFueSB1c2VyIGlucHV0IG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkNvbXBsZXRlXSByZW1vdmVzIHRoaXMgcGx1Z2luIGFmdGVyIHNuYXBwaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uSW50ZXJydXB0XSByZW1vdmVzIHRoaXMgcGx1Z2luIGlmIGludGVycnVwdGVkIGJ5IGFueSB1c2VyIGlucHV0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmZvcmNlU3RhcnRdIHN0YXJ0cyB0aGUgc25hcCBpbW1lZGlhdGVseSByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIHZpZXdwb3J0IGlzIGF0IHRoZSBkZXNpcmVkIHpvb21cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubm9Nb3ZlXSB6b29tIGJ1dCBkbyBub3QgbW92ZVxyXG4gICAgICpcclxuICAgICAqIEBldmVudCBzbmFwLXpvb20tc3RhcnQoVmlld3BvcnQpIGVtaXR0ZWQgZWFjaCB0aW1lIGEgZml0IGFuaW1hdGlvbiBzdGFydHNcclxuICAgICAqIEBldmVudCBzbmFwLXpvb20tZW5kKFZpZXdwb3J0KSBlbWl0dGVkIGVhY2ggdGltZSBmaXQgcmVhY2hlcyBpdHMgdGFyZ2V0XHJcbiAgICAgKiBAZXZlbnQgc25hcC16b29tLWVuZChWaWV3cG9ydCkgZW1pdHRlZCBlYWNoIHRpbWUgZml0IHJlYWNoZXMgaXRzIHRhcmdldFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy53aWR0aCA9IG9wdGlvbnMud2lkdGhcclxuICAgICAgICB0aGlzLmhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0XHJcbiAgICAgICAgaWYgKHRoaXMud2lkdGggPiAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy54X3NjYWxlID0gcGFyZW50Ll9zY3JlZW5XaWR0aCAvIHRoaXMud2lkdGhcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaGVpZ2h0ID4gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMueV9zY2FsZSA9IHBhcmVudC5fc2NyZWVuSGVpZ2h0IC8gdGhpcy5oZWlnaHRcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy54SW5kZXBlbmRlbnQgPSB1dGlscy5leGlzdHModGhpcy54X3NjYWxlKVxyXG4gICAgICAgIHRoaXMueUluZGVwZW5kZW50ID0gdXRpbHMuZXhpc3RzKHRoaXMueV9zY2FsZSlcclxuICAgICAgICB0aGlzLnhfc2NhbGUgPSB0aGlzLnhJbmRlcGVuZGVudCA/IHRoaXMueF9zY2FsZSA6IHRoaXMueV9zY2FsZVxyXG4gICAgICAgIHRoaXMueV9zY2FsZSA9IHRoaXMueUluZGVwZW5kZW50ID8gdGhpcy55X3NjYWxlIDogdGhpcy54X3NjYWxlXHJcblxyXG4gICAgICAgIHRoaXMudGltZSA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMudGltZSwgMTAwMClcclxuICAgICAgICB0aGlzLmVhc2UgPSB1dGlscy5lYXNlKG9wdGlvbnMuZWFzZSwgJ2Vhc2VJbk91dFNpbmUnKVxyXG4gICAgICAgIHRoaXMuY2VudGVyID0gb3B0aW9ucy5jZW50ZXJcclxuICAgICAgICB0aGlzLm5vTW92ZSA9IG9wdGlvbnMubm9Nb3ZlXHJcbiAgICAgICAgdGhpcy5zdG9wT25SZXNpemUgPSBvcHRpb25zLnN0b3BPblJlc2l6ZVxyXG4gICAgICAgIHRoaXMucmVtb3ZlT25JbnRlcnJ1cHQgPSBvcHRpb25zLnJlbW92ZU9uSW50ZXJydXB0XHJcbiAgICAgICAgdGhpcy5yZW1vdmVPbkNvbXBsZXRlID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy5yZW1vdmVPbkNvbXBsZXRlLCB0cnVlKVxyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0ID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy5pbnRlcnJ1cHQsIHRydWUpXHJcbiAgICAgICAgaWYgKHRoaXMudGltZSA9PT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHBhcmVudC5jb250YWluZXIuc2NhbGUueCA9IHRoaXMueF9zY2FsZVxyXG4gICAgICAgICAgICBwYXJlbnQuY29udGFpbmVyLnNjYWxlLnkgPSB0aGlzLnlfc2NhbGVcclxuICAgICAgICAgICAgaWYgKHRoaXMucmVtb3ZlT25Db21wbGV0ZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQucmVtb3ZlUGx1Z2luKCdzbmFwLXpvb20nKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuZm9yY2VTdGFydClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlU25hcHBpbmcoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVTbmFwcGluZygpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgc2NhbGUgPSB0aGlzLnBhcmVudC5zY2FsZVxyXG4gICAgICAgIHRoaXMuc25hcHBpbmcgPSB7IHRpbWU6IDAsIHN0YXJ0WDogc2NhbGUueCwgc3RhcnRZOiBzY2FsZS55LCBkZWx0YVg6IHRoaXMueF9zY2FsZSAtIHNjYWxlLngsIGRlbHRhWTogdGhpcy55X3NjYWxlIC0gc2NhbGUueSB9XHJcbiAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnc25hcC16b29tLXN0YXJ0JywgdGhpcy5wYXJlbnQpXHJcbiAgICB9XHJcblxyXG4gICAgcmVzaXplKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnNuYXBwaW5nID0gbnVsbFxyXG5cclxuICAgICAgICBpZiAodGhpcy53aWR0aCA+IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnhfc2NhbGUgPSB0aGlzLnBhcmVudC5fc2NyZWVuV2lkdGggLyB0aGlzLndpZHRoXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmhlaWdodCA+IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnlfc2NhbGUgPSB0aGlzLnBhcmVudC5fc2NyZWVuSGVpZ2h0IC8gdGhpcy5oZWlnaHRcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy54X3NjYWxlID0gdGhpcy54SW5kZXBlbmRlbnQgPyB0aGlzLnhfc2NhbGUgOiB0aGlzLnlfc2NhbGVcclxuICAgICAgICB0aGlzLnlfc2NhbGUgPSB0aGlzLnlJbmRlcGVuZGVudCA/IHRoaXMueV9zY2FsZSA6IHRoaXMueF9zY2FsZVxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0KClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnNuYXBwaW5nID0gbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIHdoZWVsKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5yZW1vdmVPbkludGVycnVwdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnJlbW92ZVBsdWdpbignc25hcC16b29tJylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG93bigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlT25JbnRlcnJ1cHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5yZW1vdmVQbHVnaW4oJ3NuYXAtem9vbScpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuaW50ZXJydXB0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zbmFwcGluZyA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGVsYXBzZWQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmludGVycnVwdCAmJiB0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpICE9PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgb2xkQ2VudGVyXHJcbiAgICAgICAgaWYgKCF0aGlzLmNlbnRlciAmJiAhdGhpcy5ub01vdmUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBvbGRDZW50ZXIgPSB0aGlzLnBhcmVudC5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLnNuYXBwaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjYWxlLnggIT09IHRoaXMueF9zY2FsZSB8fCB0aGlzLnBhcmVudC5zY2FsZS55ICE9PSB0aGlzLnlfc2NhbGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlU25hcHBpbmcoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuc25hcHBpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBzbmFwcGluZyA9IHRoaXMuc25hcHBpbmdcclxuICAgICAgICAgICAgc25hcHBpbmcudGltZSArPSBlbGFwc2VkXHJcbiAgICAgICAgICAgIGlmIChzbmFwcGluZy50aW1lID49IHRoaXMudGltZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUuc2V0KHRoaXMueF9zY2FsZSwgdGhpcy55X3NjYWxlKVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucmVtb3ZlT25Db21wbGV0ZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5yZW1vdmVQbHVnaW4oJ3NuYXAtem9vbScpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdzbmFwLXpvb20tZW5kJywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNuYXBwaW5nID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc25hcHBpbmcgPSB0aGlzLnNuYXBwaW5nXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS54ID0gdGhpcy5lYXNlKHNuYXBwaW5nLnRpbWUsIHNuYXBwaW5nLnN0YXJ0WCwgc25hcHBpbmcuZGVsdGFYLCB0aGlzLnRpbWUpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS55ID0gdGhpcy5lYXNlKHNuYXBwaW5nLnRpbWUsIHNuYXBwaW5nLnN0YXJ0WSwgc25hcHBpbmcuZGVsdGFZLCB0aGlzLnRpbWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgY2xhbXAgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydjbGFtcC16b29tJ11cclxuICAgICAgICAgICAgaWYgKGNsYW1wKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbGFtcC5jbGFtcCgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCF0aGlzLm5vTW92ZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKG9sZENlbnRlcilcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKHRoaXMuY2VudGVyKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc3VtZSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5zbmFwcGluZyA9IG51bGxcclxuICAgICAgICBzdXBlci5yZXN1bWUoKVxyXG4gICAgfVxyXG59Il19