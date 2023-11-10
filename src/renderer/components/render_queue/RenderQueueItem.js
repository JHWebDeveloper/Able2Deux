import React, { useCallback, useEffect, useMemo } from 'react'
import { arrayOf, bool, exact, func, number, oneOf, shape, string } from 'prop-types'

import { MEDIA_TYPES, STATUS } from 'constants'

import {
  capitalize,
  clamp,
  getStatusColor
} from 'utilities'

import PopupMenu from '../form_elements/PopupMenu'

const { interop } = window.ABLE2

const RenderQueueItem = ({ item, promiseQueue, isLast, renderMedia, cancelRender, dispatch }) => {
  const { id, filename, mediaType, renderStatus, renderPercent, exportPaths } = item
  const color = useMemo(() => getStatusColor(renderStatus), [renderStatus])
  const folderButtonTitle = `View in ${interop.isMac ? 'Finder' : 'Explorer'}`
  const renderComplete = renderStatus === STATUS.COMPLETE

  const progressValue = useMemo(() => {
    if (renderComplete) {
      return 1
    } else if (mediaType !== 'image') {
      return clamp(renderPercent / 100, 0, 1)
    } else {
      return null
    }
  }, [renderStatus, renderPercent])

  const dispatchCancelRender = useCallback(() => {
    dispatch(cancelRender(id, renderStatus))
  }, [renderStatus])

  useEffect(() => {
    promiseQueue.add(() => dispatch(renderMedia(item)), id)

    if (isLast) promiseQueue.start()
  }, [])

  return (
    <div className="queue-item">
			<span
				title={capitalize(renderStatus)}
				style={{ color }}>lens</span>
			<span>
				<input
          type="text"
          value={filename}
          readOnly />
				<span></span>
				<progress
					data-status={renderStatus}
          value={progressValue}></progress>
			</span>
      {renderComplete && exportPaths.length > 1 ? (
        <PopupMenu
          alignment="bottom right"
          icon="folder"
          label={folderButtonTitle}
          options={exportPaths.map(path => ({
            type: 'button',
            label: `Reveal in ${path.split('/').at(-2)}`,
            action() {
              interop.revealInSaveLocation(path)
            }
          }))} />
      ) : renderComplete ? (
        <button
          type="button"
          className="symbol"
          title={folderButtonTitle}
          aria-label={folderButtonTitle}
          onClick={() => interop.revealInSaveLocation(exportPaths[0])}>folder</button>
      ) : (
        <button
          type="button"
          className="symbol"
          title="Cancel Render"
          aria-label="Cancel Render"
          onClick={dispatchCancelRender}
          disabled={renderStatus === STATUS.CANCELLED || renderStatus === STATUS.FAILED}>close</button>
      )}
		</div>
  )
}

RenderQueueItem.propTypes = {
  item: shape({
    id: string.isRequired,
    filename: string,
    mediaType: oneOf(MEDIA_TYPES).isRequired,
    renderStatus: oneOf([STATUS.PENDING, STATUS.RENDERING, STATUS.COMPLETE, STATUS.FAILED, STATUS.CANCELLED]).isRequired,
    renderPercent: number.isRequired,
    exportPaths: arrayOf(string).isRequired
  }),
  promiseQueue: exact({
    add: func,
    clear: func,
    remove: func,
    start: func
  }).isRequired,
  isLast: bool.isRequired,
  renderMedia: func.isRequired,
  cancelRender: func.isRequired,
  dispatch: func.isRequired
}

export default RenderQueueItem
