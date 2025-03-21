import React, { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { arrayOf, bool, exact, object, oneOf, string } from 'prop-types'

import ButtonWithIcon from '../form_elements/ButtonWithIcon'

const { interop } = window.ABLE2

const SaveButtons = ({ media, batchName, saveLocations }) => {
	const navigate = useNavigate()

	const startRender = useCallback(mediaToRender => {
		const renderStarted = new Date()

		interop.openRenderQueue({
			media: mediaToRender.map(item => ({
				...item,
				renderStarted
			})),
			batchName,
			saveLocations
		})
	}, [batchName, saveLocations])
	
	return (
		<div id="save">
			<ButtonWithIcon
				label="Back"
				icon="arrow_back"
				onClick={() => navigate('/')} />
			<ButtonWithIcon
				label="Save"
				icon="save"
				onClick={() => startRender(media)} />
		</div>
	)
}

SaveButtons.propTypes = {
	media: arrayOf(object).isRequired,
	batchName: exact({
		batchNameType: oneOf(['replace', 'prepend_append']),
		batchName: string,
		batchNamePrepend: string,
		batchNameAppend: string
	}).isRequired,
	saveLocations: arrayOf(exact({
		checked: bool,
		directory: string,
		hidden: bool,
		id: string,
		label: string
	})).isRequired
}

export default SaveButtons
