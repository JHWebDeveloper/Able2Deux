import React, { useContext, useMemo, useRef } from 'react'

import 'css/render_queue.css'

import { PrefsContext, PrefsProvider, RenderQueueContext, RenderQueueProvider } from 'store'
import { createCancelRenderAction, createRenderAction } from 'actions'
import { usePreloadFont } from 'hooks'
import { CANVAS_FONTS } from 'constants'
import { createPromiseQueue } from 'utilities'

import RenderQueueItem from './RenderQueueItem'
import RenderQueueActions from './RenderQueueActions'

const RenderQueue = () => {
	const { autoPNG, concurrent, customFrameRate, h264Preset, renderFrameRate, renderOutput } = useContext(PrefsContext).preferences
	const { media, directories, dispatch } = useContext(RenderQueueContext)
	const promiseQueue = useRef(createPromiseQueue(concurrent))

	const renderMedia = useMemo(() => createRenderAction({
		autoPNG,
		customFrameRate,
		directories,
		h264Preset,
		renderFrameRate,
		renderOutput
	}), [])

	const cancelRender = useMemo(() => createCancelRenderAction(promiseQueue.current), [])

	return (
		<main className="queue-list">
			<div className="populated">
				{media.map((item, i) => (
					<RenderQueueItem
						key={item.id}
						item={item}
						promiseQueue={promiseQueue.current}
						isLast={i === media.length - 1}
						renderMedia={renderMedia}
						cancelRender={cancelRender}
						dispatch={dispatch} />
				))}
			</div>
			<RenderQueueActions
				media={media}
				cancelRender={cancelRender}
				dispatch={dispatch} />
		</main>
	)
}

const RenderQueueMountWithAsyncDependencies = () => {
	const { prefsLoaded } = useContext(PrefsContext)
	const { mediaLoaded } = useContext(RenderQueueContext)
	const [ fontsLoaded ] = usePreloadFont(CANVAS_FONTS)

	return prefsLoaded && mediaLoaded && fontsLoaded
		? <RenderQueue />
		: <></>
}

export default () => (
	<PrefsProvider>
		<RenderQueueProvider>
			<RenderQueueMountWithAsyncDependencies />
		</RenderQueueProvider>
	</PrefsProvider>
)
