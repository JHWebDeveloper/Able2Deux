import React, { Fragment, useId } from 'react'
import { arrayOf, bool, func, object, oneOfType, shape, string } from 'prop-types'

import Popup from './Popup'

const PopupMenuOptions = ({ options, navigateWithKeys, parentMenu }) => {
	const menuId = useId()

	return (options instanceof Function ? options() : options).map((props, i) => {
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
						options={submenu}
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
	options,
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
		<PopupMenuOptions options={options} />
	</Popup>
)

const parentMenuPropType = oneOfType([
	func,
	shape({
		current: object
	})
])

const optionPropType = shape({
	action: func,
	hide: bool,
	label: string,
	shortcut: string,
	type: string
})

optionPropType.submenu = oneOfType([func, arrayOf(optionPropType)])

PopupMenuOptions.propTypes = {
	options: oneOfType([func, arrayOf(optionPropType)]).isRequired,
	navigateWithKeys: func,
	parentMenu: parentMenuPropType
}

PopupMenu.propTypes = {
	options: oneOfType([func, arrayOf(optionPropType)]).isRequired,
	alignment: string,
	label: string,
	icon: string,
	parentMenu: parentMenuPropType,
	autoFocus: bool,
	submenu: bool
}

export default PopupMenu
