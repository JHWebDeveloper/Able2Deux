import React, { useContext } from 'react'

import 'css/presets.css'

import { PresetsProvider, PresetsContext } from 'store'

import PresetSelector from './PresetSelector'
import ButtonWithIcon from '../form_elements/ButtonWithIcon'

const Presets = () => {
	const { presets, dispatch } = useContext(PresetsContext).presets

	return (
		<main>
			<form>
				<PresetSelector
					presets={presets}
					dispatch={dispatch} />
				<div>
				</div>
				<div>
					<ButtonWithIcon
						label="Preset"
						icon="add" />
					<ButtonWithIcon
						label="Batch Preset"
						icon="add" />
				</div>
			</form>
		</main>
	)
}

export default () => (
	<PresetsProvider>
		<Presets />
	</PresetsProvider>
)
