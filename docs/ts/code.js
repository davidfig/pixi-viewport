"use strict";
exports.__esModule = true;
// import 'pixi.js'
var demo_1 = require("./demo");
var options = {
    distance: 50,
    radius: 0,
    noDecelerate: false,
    'decelerate-plugin': true,
    reverse: false,
    linear: false,
    speed: 8,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    allowButtons: false
};
function mouseEdges() {
    demo_1.viewport.mouseEdges(options);
    if (options['decelerate-plugin']) {
        demo_1.viewport.decelerate();
    }
    else if (demo_1.viewport.plugins.decelerate) {
        demo_1.viewport.removePlugin('decelerate');
    }
}
window.addEventListener('load', function () {
    demo_1.demo('mouseEdges', options, mouseEdges);
});
