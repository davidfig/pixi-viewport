import * as Penner from 'penner'

export function exists(a: any): boolean
{
    return a !== undefined && a !== null
}

/**
 * returns correct Penner equation using string or Function
 * @param {defaults} default penner equation to use if none is provided
 * */

export function ease(ease: Function|string, defaults: string) : Function
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