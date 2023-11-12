import React from 'react'
import { arrayOf, func, oneOf, shape } from 'prop-types'

import { STATUS } from 'constants'

import ButtonWithIcon from '../form_elements/ButtonWithIcon'

const { interop } = window.ABLE2

const RenderQueueActions = ({ media, cancelRender, dispatch }) => {
	const cancelAllRenders = () => {
		for (const { id, renderStatus } of media) {
			dispatch(cancelRender(id, renderStatus))
		}
	}

	// eslint-disable-next-line no-extra-parens
	const complete = media.every(({ renderStatus }) => (
		renderStatus === STATUS.COMPLETE ||
		renderStatus === STATUS.CANCELLED ||
		renderStatus === STATUS.FAILED
	))

	return (
		<div className="action-buttons">
			{complete ? (
				<>
					<ButtonWithIcon
						label="Close"
						icon="close"
						onClick={() => interop.closeRenderQueue()}
						autoFocus />
					<ButtonWithIcon
						label="Start Over"
						icon="restart_alt"
						onClick={() => interop.closeRenderQueue(true)} />
				</>
			) : (
				<ButtonWithIcon
					label="Cancel All"
					icon="close"
					onClick={cancelAllRenders}
					autoFocus />
			)}
		</div>
	)
}

RenderQueueActions.propTypes = {
	media: arrayOf(shape({
		renderStatus: oneOf([STATUS.PENDING, STATUS.RENDERING, STATUS.COMPLETE, STATUS.FAILED, STATUS.CANCELLED])
	})),
	cancelRender: func.isRequired,
	dispatch: func.isRequired
}

export default RenderQueueActions
