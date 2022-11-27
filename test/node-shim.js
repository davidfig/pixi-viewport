/* eslint-disable no-empty-function */
const raf = require('raf');

raf.polyfill();

if (typeof global !== 'undefined')
{
    global.window = {};
    // eslint-disable-next-line global-require
    global.performance = require('perf_hooks').performance;
    global.document = {
        body:
        {
            addEventListener: () => {},
            removeEventListener: () => {}
        },
        createElement: () =>
            ({
                getContext: () =>
                    ({
                        fillRect: () => {}
                    })
            }),
        removeElement: () => {}
    };
}
