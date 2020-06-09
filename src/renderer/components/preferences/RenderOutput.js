import React, { useCallback } from 'react'
import { func, oneOf } from 'prop-types'

import { updateStateFromEvent } from '../../actions'
import { keepInRange } from '../../utilities'

import RadioSet from '../form_elements/RadioSet'

const _720  = [1280, 720].join('x')
const _1080 = [1920, 1080].join('x')

const RenderOutput = ({ renderOutput, concurrent, dispatch }) => {
	const keepConcurrentInRange = useCallback(e => {
		dispatch(updateStateFromEvent(keepInRange(e)))
	}, [])

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
			<span className="input-option">
				<label htmlFor="concurrent">Concurrent Renders</label>
				<input
					type="number"
					name="concurrent"
					id="concurrent"
					value={concurrent}
					onChange={e => dispatch(updateStateFromEvent(e))}
					min={1}
					max={99}
					onBlur={keepConcurrentInRange}
					data-number />
			</span>
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
