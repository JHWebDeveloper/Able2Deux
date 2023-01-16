import React, { useMemo } from 'react'
import { v1 as uuid } from 'uuid'

const MediaOptionButtons = ({ buttons, toggleRevealMenu }) => {
	const menuId = useMemo(uuid, [])
	const enabledButtons = useMemo(() => buttons.filter(({ hide }) => !hide), [buttons])

	return enabledButtons.map(({ type, label, action }, i) => type === 'spacer' ? (
		<span
			key={`${menuId}_${i}`}
			className="spacer"
			aria-hidden="true"
			data-no-drag></span>
	) : (
		<button
			key={`${menuId}_${i}`}
			type="button"
			role="menuitem"
			autoFocus={i === 0}
			onClick={() => {
				action()
				toggleRevealMenu(false)
			}}
			data-no-drag>{label}</button>
	))
}

export default MediaOptionButtons
