import React, { useId, useMemo } from 'react'

const MediaOptionButtons = ({ buttons, toggleMenu }) => {
	const menuId = useId()
	const enabledButtons = useMemo(() => buttons.filter(({ hide }) => !hide), [buttons])

	return enabledButtons.map(({ type, label, action, shortcut }, i) => type === 'spacer' ? (
		<span
			key={`${menuId}_${i}`}
			className="spacer"
			aria-hidden
			data-no-drag></span>
	) : (
		<button
			key={`${menuId}_${i}`}
			type="button"
			role="menuitem"
			title={label}
			aria-label={label}
			autoFocus={i === 0}
			onClick={() => {
				action()
				toggleMenu(false)
			}}
			data-no-drag>
			<span>{label}</span>
			{shortcut ? <kbd>{shortcut}</kbd> : <></>}
		</button>
	))
}

export default MediaOptionButtons
