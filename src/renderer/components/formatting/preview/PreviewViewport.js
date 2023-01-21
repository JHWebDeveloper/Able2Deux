import React, { useCallback } from 'react'

import { updateState } from 'actions'

import { clamp, debounce, throttle } from 'utilities'

const { interop } = window.ABLE2

const PreviewViewport = ({ previewHeight, applyDimensions, dispatch, children }) => {
  const updatePreviewHeight = useCallback(height => {
    dispatch(updateState({ previewHeight: height }))
  }, [])

  const onMouseDown = useCallback(e => {
    const viewPort = e.target.previousElementSibling
    const { top, width } = viewPort.getBoundingClientRect()
    const maxHeight = 0.5625 * width

    const resizePreviewWindow = throttle(e => {
      updatePreviewHeight(clamp(e.clientY - top, 216, maxHeight))
    }, 30)

    const renderPreviewOnResize = debounce(applyDimensions, 500)

    const onMouseUp = () => {
      interop.savePreviewHeight(viewPort.clientHeight)

      document.body.style.removeProperty('cursor')

      window.removeEventListener('mousemove', resizePreviewWindow)
      window.removeEventListener('mousemove', renderPreviewOnResize)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('contextmenu', onMouseUp)
    }

    document.body.style.cursor = 'row-resize'

    window.addEventListener('mousemove', resizePreviewWindow)
    window.addEventListener('mousemove', renderPreviewOnResize)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('contextmenu', onMouseUp)
  }, [applyDimensions])

  return (
    <div id="preview-viewport">
      <div style={{ height: `${previewHeight}px` }}>
        {children}
      </div>
      <span onMouseDown={onMouseDown} tabIndex="0">
        <span aria-hidden="true">drag_handle</span>
      </span>
    </div>
  )
}

export default PreviewViewport
