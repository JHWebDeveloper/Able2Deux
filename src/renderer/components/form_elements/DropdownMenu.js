import React, { cloneElement, useCallback, useId, useState } from 'react'
import { arrayOf, element, oneOfType, string } from 'prop-types'

import { detectTabExit } from 'utilities'

const DropdownMenu = ({ icon = 'more_vert', children }) => {
	const [ menu, setMenu ] = useState(false)
	const [ position, setPosition ] = useState({ top: 0, left: 0 })

	const menuRefId = useId()

	const getPositionRelativeToWindow = useCallback(e => {
		const { bottom, left } = e.target.getBoundingClientRect()

		setPosition({
			top: `${bottom + 3}px`,
			left: `${left}px`
		})
	}, [])

	const closeMenuOnBlur = useCallback(detectTabExit(setMenu), [])

	return (
		<span className="dropdown" onBlur={closeMenuOnBlur}>
			<button
				type="button"
				title="Options"
				className="symbol"
				onClick={e => {
					getPositionRelativeToWindow(e)
					setMenu(!menu)
				}}
				aria-label="Options"
				aria-haspopup
				aria-expanded={menu}
				aria-controls={menuRefId}>{icon}</button>
			{menu ? (
				<span
					role="menu"
					aria-label="Options"
					id={menuRefId}
					style={position}>
					{cloneElement(children, { setMenu })}
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
