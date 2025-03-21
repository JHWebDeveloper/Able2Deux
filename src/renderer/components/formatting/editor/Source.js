import React, { memo, useCallback, useMemo } from 'react'
import { bool, func, string, oneOf } from 'prop-types'

import {
	applyToAll,
	applyToSelection,
	copyAttributes,
	saveAsPreset
} from 'actions'

import { useWarning } from 'hooks'

import {
	createObjectPicker,
	createSettingsMenu,
	objectsAreEqual
} from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import FieldsetWrapper from '../../form_elements/FieldsetWrapper'
import Checkbox from '../../form_elements/Checkbox'

const extractSourceProps = createObjectPicker(['sourceName', 'sourcePrefix', 'sourceOnTop'])

const Source = memo(({
	id,
	sourceName,
	sourcePrefix,
	sourceOnTop,
	updateSelectionFromEvent,
	toggleSelectionCheckbox
}) => {
	const warn = useWarning({
		name: 'sourceOnTop',
		message: 'A source on top is not for aesthetics!',
		detail: 'This option shoud only be selected if the source would obscure important details or appear illegible at the bottom of the video. If you are using this option for any other reason please choose cancel.',
		skip: sourceOnTop
	}, [id, sourceOnTop])

	const sourceOnTopWarning = useCallback(e => warn({
		onConfirm() {
			toggleSelectionCheckbox(e)
		}
	}), [id, sourceOnTop, warn])

	return (
		<>
			<FieldsetWrapper label="Source Name">				
				<input
					type="text"
					name="sourceName"
					className="panel-input"
					title="Source Name"
					aria-label="Source Name"
					placeholder="If none, leave blank"
					list="source-suggestions"
					value={sourceName}
					onChange={updateSelectionFromEvent} />
			</FieldsetWrapper>
			<Checkbox
				label={'Add "Source: " to beginning'}
				name="sourcePrefix"
				checked={sourcePrefix}
				onChange={toggleSelectionCheckbox} />
			<Checkbox
				label="Place source at top of video"
				name="sourceOnTop"
				checked={sourceOnTop}
				onChange={sourceOnTopWarning} />
		</>
	)
}, objectsAreEqual)

const SourcePanel = ({ multipleItems, multipleItemsSelected, dispatch, ...rest }) => {
	const { id } = rest

	// eslint-disable-next-line no-extra-parens
	const settingsMenu = useMemo(() => (
		createSettingsMenu(multipleItems, multipleItemsSelected, [
			() => dispatch(copyAttributes(id, extractSourceProps)),
			() => dispatch(applyToSelection(id, extractSourceProps)),
			() => dispatch(applyToAll(id, extractSourceProps)),
			() => dispatch(saveAsPreset(id, extractSourceProps))
		])
	), [multipleItems, multipleItemsSelected, id])

	return (
		<AccordionPanel
			heading="Source"
			id="source"
			className="editor-options"
			options={settingsMenu}
			initOpen>
			<Source {...rest} />
		</AccordionPanel>
	)
}

const sharedPropTypes = {
	id: string.isRequired,
	sourceName: string.isRequired,
	sourcePrefix: bool.isRequired,
	sourceOnTop: bool.isRequired,
	background: oneOf(['blue', 'grey', 'light_blue', 'dark_blue', 'teal', 'tan', 'alpha', 'color']).isRequired,
	updateSelectionFromEvent: func.isRequired,
	toggleSelectionCheckbox: func.isRequired
}

SourcePanel.propTypes = {
	...sharedPropTypes,
	multipleItems: bool.isRequired,
	multipleItemsSelected: bool.isRequired,
	dispatch: func.isRequired
}

Source.propTypes = sharedPropTypes

export default SourcePanel
