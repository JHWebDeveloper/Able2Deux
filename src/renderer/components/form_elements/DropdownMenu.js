import React, { cloneElement, useCallback, useMemo, useState } from 'react'
import { arrayOf, element, oneOfType, string } from 'prop-types'
import { v1 as uuid } from 'uuid'

import { detectTabExit } from 'utilities'

const DropdownMenu = ({ icon = 'more_vert', children }) => {
	const [ revealMenu, toggleRevealMenu ] = useState(false)
	const [ position, setPosition ] = useState({ top: 0, left: 0 })

	const menuRefId = useMemo(uuid, [])

	const getPositionRelativeToWindow = useCallback(e => {
		const { bottom, left } = e.target.getBoundingClientRect()

		setPosition({
			top: `${bottom + 3}px`,
			left: `${left}px`
		})
	}, [])

	const closeMenuOnBlur = useCallback(detectTabExit(toggleRevealMenu), [])

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
				aria-label="Options"
				aria-haspopup="true"
				aria-expanded={revealMenu}
				aria-controls={menuRefId}>{icon}</button>
			{revealMenu ? (
				<span
					role="menu"
					aria-label="Options"
					id={menuRefId}
					style={position}>
					{cloneElement(children, { toggleRevealMenu })}
				</span>
			) : <></>}
		</span>
	)
}

DropdownMenu.propTypes = {
	icon: string,
	children: oneOfType([element, arrayOf(element)])
}

export default DropdownMenu
