import * as PIXI from 'pixi.js'

import { Plugin } from './plugin'

/**
 * @typedef PaintOptions
 * @property {string} [mouseButtons=all] changes which mouse buttons trigger drag, use: 'all', 'left', right' 'middle', or some combination, like, 'middle-right'
 */

const paintOptions = {
	mouseButtons: 'all'
}

/**
 * @private
 */
export class Paint extends Plugin
{
	/**
	 * @param {Viewport} parent
	 * @param {PaintOptions} options
	 */
	constructor(parent, options={})
	{
		super(parent)
		this.options = Object.assign({}, paintOptions, options)
		this.painted = false
		
		this.mouseButtons(this.options.mouseButtons)
	}
	
	/**
	 * initialize mousebuttons array
	 * @param {string} buttons
	 */
	mouseButtons(buttons)
	{
		if (!buttons || buttons === 'all')
		{
			this.mouse = [true, true, true]
		}
		else
		{
			this.mouse = [
				buttons.indexOf('left') === -1 ? false : true,
				buttons.indexOf('middle') === -1 ? false : true,
				buttons.indexOf('right') === -1 ? false : true
			]
		}
	}
	
	/**
	 * @param {PIXI.interaction.InteractionEvent} event
	 * @returns {boolean}
	 */
	checkButtons(event)
	{
		const isMouse = event.data.pointerType === 'mouse'
		const count = this.parent.input.count()
		if ((count === 1) || (count > 1 && !this.parent.plugins.get('pinch')))
		{
			if (!isMouse || this.mouse[event.data.button])
			{
				return true
			}
		}
		return false
	}
	
	/**
	 * @param {PIXI.interaction.InteractionEvent} event
	 */
	down(event)
	{
		if (this.paused)
		{
			return
		}
		if (this.checkButtons(event))
		{
			this.last = { x: event.data.global.x, y: event.data.global.y }
			this.current = event.data.pointerId
			return true
		}
		else
		{
			this.last = null
		}
	}
	
	get active()
	{
		return this.painted
	}
	
	/**
	 * @param {PIXI.interaction.InteractionEvent} event
	 */
	move(event)
	{
		if (this.paused)
		{
			return
		}
		if (this.last && this.current === event.data.pointerId)
		{
			const x = event.data.global.x
			const y = event.data.global.y
			const count = this.parent.input.count()
			if (count === 1 || (count > 1 && !this.parent.plugins.get('pinch')))
			{
				const distX = x - this.last.x
				const distY = y - this.last.y
				if (this.painted || ((this.parent.input.checkThreshold(distX) || this.parent.input.checkThreshold(distY)) && (!this.parent.plugins.get('drag') || !this.parent.plugins.get('drag').active)))
				{
					this.last = { x, y }
					if (!this.painted)
					{
						const screen = new PIXI.Point(this.last.x, this.last.y)
						const world = this.parent.toWorld(screen)
						this.paintStart = screen
						this.paintStartWorld = this.parent.toWorld(this.paintStart)
						
						this.parent.emit('paint-start', {
							interactionEvent: event,
							screen,
							screenStart: screen,
							viewport: this.parent,
							world,
							worldStart: world,
						})
					}
					
					this.painted = true
					
					const screen = event.data.global.clone()
					this.parent.emit('painted', {
						interactionEvent: event,
						screen,
						screenStart: this.paintStart,
						viewport: this.parent,
						world: this.parent.toWorld(screen),
						worldStart: this.paintStartWorld,
					})
					
					return true
				}
			}
			else
			{
				this.painted = false
			}
		}
	}
	
	/**
	 * @param {PIXI.interaction.InteractionEvent} event
	 * @returns {boolean}
	 */
	up(event)
	{
		const touches = this.parent.input.touches
		if (touches.length === 1)
		{
			const pointer = touches[0]
			if (pointer.last)
			{
				this.last = { x: pointer.last.x, y: pointer.last.y }
				this.current = pointer.id
			}
			this.painted = false
			return true
		}
		else if (this.last)
		{
			if (this.painted)
			{
				const screen = event.data.global.clone()
				
				this.parent.emit('paint-end', {
					interactionEvent: event,
					screen,
					screenStart: this.paintStart,
					viewport: this.parent,
					world: this.parent.toWorld(screen),
					worldStart: this.paintStartWorld
				})
				
				this.last = null
				this.painted = false
				this.paintStart = null
				return true
			}
		}
	}
	
	resume()
	{
		this.last = null
		this.paused = false
	}
	
}