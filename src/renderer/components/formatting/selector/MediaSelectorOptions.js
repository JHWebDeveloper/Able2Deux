import React from 'react'

import { selectAllMedia } from 'actions'

const MediaSelectorOptions = ({ dispatch }) => {
  return (
    <div>
      <button
        type="button"
        name="selectAll"
        className="app-button"
        onClick={() => dispatch(selectAllMedia())}>Select All</button>
    </div>
  )
}

export default MediaSelectorOptions
