const raf = require('raf')
raf.polyfill()

if (typeof global !== 'undefined')
{
    global.window = {}
    global.performance = require('perf_hooks').performance
    global.document = {
        body:
        {
            addEventListener: () => {},
            removeEventListener: () => {}
        },
        createElement: () =>
        {
            return {
                getContext: () =>
                {
                    return {
                        fillRect: () => {}
                    }
                }
            }
        },
        removeElement: () => {}
    }
}