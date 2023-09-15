import React from 'react'
import { useNavigate } from 'react-router'
import { func } from 'prop-types'

import ButtonWithIcon from '../form_elements/ButtonWithIcon'

const SaveButtons = ({ setRendering }) => {
	const navigate = useNavigate()
	
	return (
		<div id="save">
			<ButtonWithIcon
				label="Back"
				icon="arrow_back"
				onClick={() => navigate('/')} />
			<ButtonWithIcon
				label="Save"
				icon="save"
				onClick={() => setRendering(true)} />
		</div>
	)
}

SaveButtons.propTypes = {
	setRendering: func.isRequired
}

export default SaveButtons
