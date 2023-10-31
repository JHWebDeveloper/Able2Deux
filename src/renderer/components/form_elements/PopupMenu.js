import React, { Fragment, useId } from 'react'
import { arrayOf, bool, func, object, oneOfType, shape, string } from 'prop-types'

import Popup from './Popup'

const PopupMenuOptions = ({ buttons, navigateWithKeys, parentMenu }) => {
	const menuId = useId()

	return (buttons instanceof Function ? buttons() : buttons).map((props, i) => {
		const { hide, type, label, action, shortcut, submenu } = props
		const key = `${menuId}_${i}`

		if (hide) return <Fragment key={key} />

		switch (type) {
			case 'button':
				return (
					<button
						key={key}
						type="button"
						role="menuitem"
						aria-label={label}
						autoFocus={i === 0}
						onClick={action}
						onKeyDown={navigateWithKeys}
						data-no-drag>
						<span>{label}</span>
						{shortcut ? <kbd>{shortcut}</kbd> : <></>}
					</button>
				)
			case 'spacer':
				return (
					<span
						key={key}
						className="spacer"
						aria-hidden
						data-no-drag>
						{label ? <span>{label}</span> : <></>}
					</span>
				)
			case 'submenu':
				return (
					<PopupMenu
						key={key}
						buttons={submenu}
						alignment="right top"
						label={label}
						parentMenu={parentMenu}
						autoFocus={i === 0}
						submenu />
				)
			default:
				return <Fragment key={key} />
		}
	})
}

const PopupMenu = ({
	alignment = 'bottom left',
	icon = 'more_vert',
	label,
	buttons,
	submenu,
	parentMenu,
	autoFocus
}) => (
	<Popup
		alignment={alignment}
		label={label}
		showTooltip
		submenu={submenu}
		parentMenu={parentMenu}
		autoFocus={autoFocus}
		{...submenu ? {} : { icon }}>
		<PopupMenuOptions buttons={buttons} />
	</Popup>
)

const parentMenuPropType = oneOfType([
	func,
	shape({
		current: object
	})
])

const buttonPropType = shape({
	action: func,
	hide: bool,
	label: string,
	shortcut: string,
	type: string
})

buttonPropType.submenu = oneOfType([func, arrayOf(buttonPropType)])

PopupMenuOptions.propTypes = {
	buttons: oneOfType([func, arrayOf(buttonPropType)]).isRequired,
	navigateWithKeys: func,
	parentMenu: parentMenuPropType
}

PopupMenu.propTypes = {
	buttons: oneOfType([func, arrayOf(buttonPropType)]).isRequired,
	alignment: string,
	label: string,
	icon: string,
	parentMenu: parentMenuPropType,
	autoFocus: bool,
	submenu: bool
}

export default PopupMenu
