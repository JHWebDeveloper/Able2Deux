import React from 'react'
import { arrayOf, bool, func, number, shape, string } from 'prop-types'

import Slider from './Slider'
import LinkIcon from '../svg/LinkIcon'

const SliderPair = ({ link, linkAction, sliders, pairAction }) => {	
	return (
		<div className="slider-pair">
			<Slider
				{...sliders[0]}
				onChange={link ? pairAction : sliders[0].onChange} />
			<Slider
				{...sliders[1]}
				onChange={link ? pairAction : sliders[1].onChange} />
			<button
				type="button"
				name="link"
				title={`${link ? 'Unlink' : 'Link'} Values`}
				onClick={linkAction}>
				<LinkIcon linked={link}/>
			</button>
		</div>
	)
}

SliderPair.propTypes = {
	link: bool.isRequired,
	linkAction: func.isRequired,
	sliders: arrayOf(shape({
		label: string,
		name: string.isRequired,
		value: number,
		defaultValue: number,
		points: arrayOf(number),
		min: number,
		max: number,
		unit: string,
		disabled: bool,
		onChange: func.isRequired
	})),
	pairAction: func.isRequired
}

export default SliderPair
