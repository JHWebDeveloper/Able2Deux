export const extractSettings = settings => {
	const  { arc, background, overlay, source, centering, position, scale, crop, rotation } = settings
	return { arc, background, overlay, source, centering, position, scale, crop, rotation }
}

export const extractSettingsToArray = settings => {
	const  { start, audio, arc, background, overlay, source, centering, position, scale, crop, rotation } = settings
	return [ start, audio, arc, background, overlay, source, centering, position, scale, crop, rotation ]
}
