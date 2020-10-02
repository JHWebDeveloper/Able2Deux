import React, { useCallback } from 'react'
import { func, number, oneOf, bool } from 'prop-types'

import { updateStateFromEvent, toggleCheckbox } from '../../actions'
import { keepInRange } from '../../utilities'

import RadioSet from '../form_elements/RadioSet'
import Checkbox from '../form_elements/Checkbox'

const _720 = [1280, 720].join('x')
const _1080 = [1920, 1080].join('x')

const RenderOutput = ({ renderOutput, renderFrameRate, autoPNG, asperaSafe, concurrent, dispatch }) => {
	const keepConcurrentInRange = useCallback(e => {
		dispatch(updateStateFromEvent(keepInRange(e)))
	}, [])

	return (
		<div>
			<fieldset>
				<legend>Output Resolution</legend>
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
			<fieldset>
				<legend>Output Frame Rate</legend>
				<div>
					<RadioSet 
						name="renderFrameRate"
						state={renderFrameRate}
						onChange={e => dispatch(updateStateFromEvent(e))}
						buttons={[
							{
								label: 'Auto',
								value: 'auto'
							},
							{
								label: '59.94fps',
								value: '59.94fps'
							}
						]}/>
				</div>
			</fieldset>
			<Checkbox
				label="Auto Export as .png"
				name="autoPNG"
				checked={autoPNG}
				onChange={e => dispatch(toggleCheckbox(e))}
				switchIcon/>
			<Checkbox
				label="Aspera Safe Characters"
				name="asperaSafe"
				checked={asperaSafe}
				onChange={e => dispatch(toggleCheckbox(e))}
				switchIcon/>
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
	renderFrameRate: oneOf([
		'auto',
		'59.94fps'
	]).isRequired,
	autoPNG: bool.isRequired,
	asperaSafe: bool.isRequired,
	concurrent: number.isRequired,
	dispatch: func.isRequired
}

export default RenderOutput
