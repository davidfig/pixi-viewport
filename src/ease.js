import Penner from 'penner'

/**
 * returns correct Penner equation using string or Function
 * @param {(function|string)} [ease]
 * @param {defaults} default penner equation to use if none is provided
 */
export default function ease(ease, defaults)
{
    if (!ease)
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