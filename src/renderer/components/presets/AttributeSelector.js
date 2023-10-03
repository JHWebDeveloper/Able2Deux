import React, { useCallback, useId } from 'react'

import { selectPreset } from 'actions'
import { classNameBuilder } from 'utilities'

import DraggableList from '../form_elements/DraggableList'

const PresetItem = ({ focused, label, index, selectPreset }) => (
	<div className={classNameBuilder({
		'preset-item': true,
		focused
	})}>
		<button
			type="button"
			onClick={() => selectPreset(index)}>{label}</button>
		<button
			type="button"
			className="symbol">close</button>
	</div>
)

const AttributeSelector = ({ allPresets, dispatch }) => {
	const presetKey = useId()
	const batchPresetKey = useId()
	const presets = allPresets.filter(({ type }) => type === 'preset')
	const batchPresets = allPresets.filter(({ type }) => type === 'batchPreset')
	const presetsLength = presets.length
	
	const dispatchSelectPreset = useCallback(index => {
		dispatch(selectPreset(index))
	}, [])

  return (
    <div className="preset-selector">
			<h2>Presets</h2>
			<DraggableList>
				{presets.map((item, i) => (
					<PresetItem
						key={`${presetKey}_${i}`}
						focused={item.focused}
						label={item.label}
						index={i}
						selectPreset={dispatchSelectPreset} />
				))}
			</DraggableList>
			<h2>Batch Presets</h2>
			<DraggableList>
				{batchPresets.map((item, i) => (
					<PresetItem
						key={`${batchPresetKey}_${i}`}
						focused={item.focused}
						label={item.label}
						index={i + presetsLength}
						selectPreset={dispatchSelectPreset} />
				))}
			</DraggableList>
    </div>
  )
}

export default AttributeSelector
