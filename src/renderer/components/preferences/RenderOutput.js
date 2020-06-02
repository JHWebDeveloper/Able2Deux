import React from 'react'
import { func, oneOf } from 'prop-types'

import { updateStateFromEvent } from '../../actions'

import RadioSet from '../form_elements/RadioSet'

const _720  = [1280, 720].join('x')
const _1080 = [1920, 1080].join('x')

const RenderOutput = ({ renderOutput, dispatch }) => {
	return (
		<div>
			<fieldset>
				<legend>Render Output</legend>
				<div>
					<RadioSet 
						name="renderOutput"
						state={renderOutput}
						onChange={e => dispatch(updateStateFromEvent(e))}
						buttons={[
							{
								label: _720,
								value: _720
							},
							{
								label: _1080,
								value: _1080
							}
						]}/>
				</div>
			</fieldset>
		</div>
	)
}

RenderOutput.propTypes = {
	renderOutput: oneOf([
		'1280x720',
		'1920x1080'
	]).isRequired,
	dispatch: func.isRequired
}

export default RenderOutput
