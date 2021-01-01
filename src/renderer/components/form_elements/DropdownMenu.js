import React, { useCallback, useMemo, useState } from 'react'
import { v1 as uuid } from 'uuid'
import { arrayOf, bool, func, shape, string } from 'prop-types'

import { detectTabExit } from 'utilities'

const DropdownMenu = ({ buttons }) => {
	const [ revealMenu, toggleRevealMenu ] = useState(false)
	const [ position, setPosition ] = useState({ top: 0, left: 0 })

	const getPositionRelativeToWindow = useCallback(e => {
		const { bottom, left } = e.target.getBoundingClientRect()

		setPosition({
			top: `${bottom + 3}px`,
			left: `${left}px`
		})
	}, [])

	const closeMenuOnBlur = useCallback(detectTabExit(toggleRevealMenu), [])

	const menuId = useMemo(uuid, [])

	return (
		<span className="dropdown" onBlur={closeMenuOnBlur}>
			<button
				type="button"
				title="Options"
				className="symbol"
				onClick={e => {
					getPositionRelativeToWindow(e)
					toggleRevealMenu(!revealMenu)
				}}
				aria-haspopup="true"
				aria-expanded={revealMenu}>more_vert</button>
			{revealMenu && (
				<span style={position}>
					{buttons.map(({ hide, type, label, action }, i) => !hide && (type === 'spacer' ? (
						<span
							key={`${menuId}_${i}`}
							className="spacer"
							aria-hidden="true"
							data-no-drag></span>
					) : (
						<button
							key={`${menuId}_${i}`}
							type="button"
							autoFocus={i === 0}
							onClick={() => {
								action()
								toggleRevealMenu(false)
							}}
							data-no-drag>{label}</button>
					)))}
				</span>
			)}
		</span>
	)
}

DropdownMenu.propTypes = {
	buttons: arrayOf(shape({
		hide: bool,
		role: string,
		label: string,
		action: func
	}))
}

export default DropdownMenu
