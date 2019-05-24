import * as Penner from 'penner'

export function exists(a)
{
    return a !== undefined && a !== null
}

export function defaults(a, defaults)
{
    return (a !== undefined && a !== null) ? a : defaults
}

/**
 * @param {(function|string)} [ease]
 * @param {string} defaults for pennr equation
 * @private
 * @returns {function} correct penner equation
 */
export function ease(ease, defaults)
{
    if (!exists(ease))
    {
        return Penner[defaults]
    }
    else if (typeof ease === 'function')
    {
        return ease
    }
    else if (typeof ease === 'string')
    {
        return Penner[ease]
    }
}