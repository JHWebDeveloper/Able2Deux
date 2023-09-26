import React from 'react'

const PresetSelector = ({ presets }) => {
  return (
    <div className="preset-selector">
      {presets.map(item => (
        <span style={{display:'block'}}>
          <button
            type="button">{item.label}</button>
          <button
            type="button"
            className="symbol">close</button>
        </span>
      ))}
    </div>
  )
}

export default PresetSelector
