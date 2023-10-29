import {
	DEFAULT_PRESET_STATE,
	DEFAULT_BATCH_PRESET_STATE,
	MEDIA_ATTRIBUTES
} from 'constants'

import { replaceIds } from 'utilities'

/**
 * preset = the preset data as stored in presets.json with attribute name and value stored as key/value pairs for each attribute
 * attributeSet = a collection attribute name, values and additional data about the attribute stored as array of objects for each attribute.
 * mediaState = the attribute name and value stored as key/value pairs taken directly from the user input, to be mapped to either of the two formats outlined above.
 */

export const mergePresetWithAttributeSet = (presetAttributes, attributeSet) => {
	const presetEntries = Object.entries(presetAttributes)
	const attributes = [...attributeSet]
	const len1 = presetEntries.length
	const len2 = attributes.length

	for (let i = 0; i < len1; i++) {
		const [ key, value ] = presetEntries[i]

		for (let j = 0; j < len2; j++) {
			const attr = attributes[j]

			if (key !== attr.attribute) continue

			attributes[j] = {
				...attr,
				include: true,
				value
			}

			break
		}
	}

	return attributes
}

export const createNewPresetAttributeSet = (presetNo, focused) => ({
	...DEFAULT_PRESET_STATE,
	label: `Preset ${presetNo + 1}`,
	attributes: [...MEDIA_ATTRIBUTES],
	focused
})

export const createNewBatchPresetAttributeSet = (presetNo, focused) => ({
	...DEFAULT_BATCH_PRESET_STATE,
	label: `Batch Preset ${presetNo + 1}`,
	attributes: [...MEDIA_ATTRIBUTES],
	focused
})

export const createAttributeSetFromPreset = preset => {
	const { presetNameAppend, presetNamePrepend, ...attributes } = preset.attributes
	
	return {
		...preset,
		presetNameAppend,
		presetNamePrepend,
		attributes: mergePresetWithAttributeSet(attributes, replaceIds(MEDIA_ATTRIBUTES)).toSorted((a, b) => a.order - b.order)
	}
}

export const createAttributeSetFromMediaState = mediaState => createAttributeSetFromPreset({
	...DEFAULT_PRESET_STATE,
	focused: true,
	attributes: mediaState
})

export const createPresetFromAttributeSet = attributeSet => {
	const {
		presetNamePrepend,
		presetNameAppend,
		attributes,
		focused, // eslint-disable-line no-unused-vars ---- destructuring to omit
		hasReferences, // eslint-disable-line no-unused-vars ---- ^
		...options
	} = attributeSet

	return {
		...options,
		attributes: {
			...attributes.reduce((acc, { include, attribute, value }) => {
				if (include) acc[attribute] = value
				return acc
			}, {}),
			...presetNamePrepend ? { presetNamePrepend } : {},
			...presetNameAppend ? { presetNameAppend } : {}
		}
	}
}

export const removeOutterAttributesForSaving = preset => ({
	...preset,
	attributes: preset.attributes.filter(attr => attr.include)
})

export const includeAttributesByMediaState = mediaState => preset => ({
	...preset,
	attributes: preset.attributes.map(attr => {
		switch (attr.attribute) {
			case 'overlay':
			case 'background':
				attr.include = mediaState.arc !== 'none'
				break
			case 'bgColor':
				attr.include = mediaState.arc !== 'none' && mediaState.background === 'color'
				break
			case 'backgroundMotion':
				attr.include = mediaState.arc !== 'none' && mediaState.background !== 'alpha' && mediaState.background !== 'color'
				break
			case 'sourceName':
			case 'sourcePrefix':
			case 'sourceOnTop':
				attr.include = !!mediaState.sourceName
				break
			case 'rotatedCentering':
				attr.include = mediaState.freeRotateMode === 'inside_bounds'
				break
			case 'keyingType':
			case 'keyingColor':
			case 'keyingSimilarity':
			case 'keyingBlend':
			case 'keyingThreshold':
			case 'keyingTolerance':
			case 'keyingSoftness':
				attr.include = mediaState.keyingEnabled
				break
			case 'ccRGB':
			case 'ccR':
			case 'ccG':
			case 'ccB':
				attr.include = mediaState.ccEnabled
				break
			default:
				attr.include = true
		}

		return attr
	})
})

export const detectCircularReference = (presets, parentId, childId) => {
	if (childId === parentId) return true
	
	const droppedPreset = presets.find(preset => preset.id === childId)

	if (droppedPreset?.type !== 'batchPreset') return false

	return droppedPreset.presetIds.some(presetId => detectCircularReference(presets, parentId, presetId))
}
