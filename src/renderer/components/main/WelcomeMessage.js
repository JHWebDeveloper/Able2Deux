import React, { useContext, useEffect } from 'react'
import toastr from 'toastr'

import { WorkspaceContext } from 'store'
import { updateWorkspaceState } from 'actions'
import { TOASTR_OPTIONS } from 'constants'

const { interop } = window.ABLE2

const WelcomeMessage = () => {
	const { workspaceLoaded, welcomeMessageAcknowledged, dispatch } = useContext(WorkspaceContext)

	useEffect(() => {
		if (!workspaceLoaded || welcomeMessageAcknowledged) return

		const onCloseClick = () => {
			dispatch(updateWorkspaceState({
				welcomeMessageAcknowledged: true
			}))
		}
		
		toastr.info(
			'For video tutorials on all of the new features in v2.4, <a style="cursor:pointer;text-decoration:underline;">click here to follow Able2 on Facebook</a>',
			'Able2 v2.4',
			{
				...TOASTR_OPTIONS,
				onclick() {
					interop.openFacebook(),
					onCloseClick()
				},
				onCloseClick
			}
		)
	}, [workspaceLoaded])

	return <></>
}

export default WelcomeMessage
