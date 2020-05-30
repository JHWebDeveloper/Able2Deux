import React from 'react'

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
						dispatch={dispatch}
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

export default RenderOutput
