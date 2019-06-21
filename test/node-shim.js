if (typeof global !== 'undefined')
{
    global.window = {}
    global.performance = require('perf_hooks').performance
    global.requestAnimationFrame = () => {}
    global.document = {
        body:
        {
            addEventListener: () => {}
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
        }
    }
}