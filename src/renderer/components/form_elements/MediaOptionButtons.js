import React, { useId, useMemo } from 'react'
import { arrayOf, bool, func, shape, string } from 'prop-types'

import DropdownMenu from './DropdownMenu'

const MediaOptionButtons = ({ buttons, navigateWithKeys, parentMenu }) => {
	const menuId = useId()
	const enabledButtons = useMemo(() => buttons.filter(({ hide }) => !hide), [buttons])

	return enabledButtons.map((props, i) => {
		const { type, label, action, shortcut } = props

		if (type === 'spacer') {
			return (
				<span
					key={`${menuId}_${i}`}
					className="spacer"
					aria-hidden
					data-no-drag></span>
			)
		} else if ('submenu' in props) {
			return (
				<DropdownMenu
					key={`${menuId}_${i}`}
					label={label}
					parentMenu={parentMenu}
					submenu>
					<MediaOptionButtons buttons={props.submenu} />
				</DropdownMenu>
			)
		} else {
			return (
				<button
					key={`${menuId}_${i}`}
					type="button"
					role="menuitem"
					title={label}
					aria-label={label}
					autoFocus={i === 0}
					onClick={action}
					onKeyDown={navigateWithKeys}
					data-no-drag>
					<span>{label}</span>
					{shortcut ? <kbd>{shortcut}</kbd> : <></>}
				</button>
			)
		}
	})
}

const buttonPropType = shape({
	type: string,
	label: string,
	hide: bool,
	shortcut: string,
	action: func,
})

buttonPropType.submenu = arrayOf(buttonPropType)

MediaOptionButtons.propTypes = {
	buttons: arrayOf(buttonPropType),
	navigateWithKeys: func
}

export default MediaOptionButtons
